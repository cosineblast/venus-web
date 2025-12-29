
<script lang="ts">
  import { match, P } from 'ts-pattern';
  import LeftBar, { type Command as LeftBarCommand } from './ui/LeftBar.svelte';
  import CommandUINode from './ui/CommandUINode.svelte';
  import ResultUINode from './ui/ResultUINode.svelte';
  import RunnerBar from './ui/RunnerBar.svelte'
  import { PaneGroup, Pane, PaneResizer } from 'paneforge';

  import { SvelteFlow, Background } from '@xyflow/svelte';

  import { CommandGraph } from './lib/graph';

  import { CommandTree, SyntaxTree } from './lib/syntax';

  import * as nushell from './lib/nushellRunner';

  import '@xyflow/svelte/dist/style.css';

  const nodeTypes = {
    command: CommandUINode,
    result: ResultUINode
  };

  // MARK: Model
 
  let uiNodes = $state.raw([
    { id: 'mathsqrt',
      type: 'command',
      position: { x: 0, y: 100 },
      data: {
        label: 'math sqrt',
        hasInput: true
      }
    },
    { id: 'result',
      position: { x: 0, y: 200 },
      data: { label: 'Result' },
      type: 'result'
    },
  ]);

  let uiEdges = $state.raw([]);

  let runnerText = $state({ type: 'ok', content: ':v'});

  let searchBarValue: string = $state('');

  let baseCommands: null | nushell.CommandList = $state(null);

  let leftBarCommands: null | LeftBarCommand[] = $derived.by(() => {
    if (baseCommands == null) {
      return null
    } else {
      return baseCommands.filter(command => commandMatches(command, searchBarValue)).map(command => ({
        name: command.name,
        category: command.category
      }))
    }
  });

  let leftBarCategory: 'commands' | 'data' = $state('commands');


  // MARK: Initialization

  async function init() {
    let commands = await nushell.getNushellCommands();

    baseCommands = commands;
  }
  // TODO: move to nushell module
  function commandMatches(command: nushell.Command, filter: string): boolean {
    return filter == '' || command.name.includes(filter) || command.category.includes(filter);
  }

  init().then();

  // MARK: Update

  async function run() {
    const graph = CommandGraph.commandGraphFromUIGraph(uiNodes, uiEdges);
    const commandTree = graph.toCommandTree();

    match(commandTree)
      .with({type: 'error'}, async (error) => {
        runnerText = { type: 'error', content: error.message };
      })
      .with(P._, async (tree) => {
        const syntaxTree = CommandTree.toSyntaxTree(tree);
        const source = SyntaxTree.toNushellSource(syntaxTree);

        console.log({ graph });
        console.log({ commandTree });
        console.log({ syntaxTree });
        console.log({ source });

        runnerText = { type: 'ok' , content: `Running ${source}...`};

        const result = await nushell.executeNushell(source);

        if (result.type == 'ok') {
          runnerText = { type: 'ok' , content: result.result};
        } else {
          runnerText = { type: 'error', content: result.message };
        }

      });
  }

  function onCategoryClick(category: 'commands' | 'data') {
    leftBarCategory = category;
  }

  function onCommandItemClick(index: number) {
    let commands = $state.snapshot(leftBarCommands);
    
    if (commands == null) {
      return;
    }

    let command = commands[index];


    uiNodes = [...uiNodes, 
      { id: self.crypto.randomUUID(),
        position: { x: 0, y: 0 }, // TODO: find center of viewport
        data: {
          label: command.name,
          hasInput: false
        },
        type: 'command'
      }
    ];

  }


</script>

<main>

  <PaneGroup direction="horizontal">
    <Pane defaultSize={25}>
      <LeftBar
        commands={leftBarCommands}
        category={leftBarCategory}
        onCategoryClick={onCategoryClick}
        onCommandClick={onCommandItemClick}
        bind:searchValue={searchBarValue}
         />
    </Pane>

    <PaneResizer style="border: 3px solid gray;" />

    <Pane>
      <PaneGroup direction="vertical">

        <Pane>
            <SvelteFlow
                bind:nodes={uiNodes}
                bind:edges={uiEdges}
                nodeTypes={nodeTypes}
                fitView>
              <Background />
            </SvelteFlow>
        </Pane>

        <PaneResizer style="border: 3px solid gray;" />

        <Pane defaultSize={10}>
          <RunnerBar
             text={runnerText}
             onRunClick={run} />
        </Pane>

      </PaneGroup>
    </Pane>
  </PaneGroup>

</main>



<style>
  main  {
    height: 100vh;
    display: flex;
  }
</style>
