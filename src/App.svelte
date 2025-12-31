
<script lang="ts">
  import { match, P } from 'ts-pattern';
  import LeftBar, { type Command as LeftBarCommand } from './ui/LeftBar.svelte';

  import CommandUINode from './ui/CommandUINode.svelte';
  import ResultUINode from './ui/ResultUINode.svelte';
  import DataUINode from './ui/DataUINode.svelte';

  import RunnerBar from './ui/RunnerBar.svelte'
  import { PaneGroup, Pane, PaneResizer } from 'paneforge';

  import { SvelteFlow, Background, type NodeTypes } from '@xyflow/svelte';

  import { CommandGraph } from './lib/graph';

  import { CommandTree, SyntaxTree } from './lib/syntax';

  import * as nushell from './lib/nushell';

  import '@xyflow/svelte/dist/style.css';

  const nodeTypes: NodeTypes = {
    command: CommandUINode,
    result: ResultUINode,
    data: DataUINode
  };

  // MARK: Model
 
  let uiNodes: any = $state.raw([
    { id: 'result',
      position: { x: 0, y: 100 },
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
      return baseCommands.filter(command => nushell.Command.matchesFilter(command, searchBarValue)).map(command => ({

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
          runnerText = { type: 'ok' , content: result.value};
        } else {
          runnerText = { type: 'error', content: result.message };
        }

      });
  }

  function onCategoryClick(category: 'commands' | 'data') {
    leftBarCategory = category;
  }

  function onCommandItemClick(index: number) {
    
    if (leftBarCommands == null || baseCommands == null) {
      return;
    }

    const commandName = leftBarCommands[index].name;

    let baseCommand = baseCommands.filter(command => command.name == commandName)[0];

    uiNodes = [...uiNodes, 
      { id: self.crypto.randomUUID(),
        position: { x: 0, y: 0 }, // TODO: find center of viewport
        data: {
          label: baseCommand.name,
          hasInput: nushell.Command.hasInput(baseCommand)
        },
        type: 'command'
      }
    ];

  }

  function onDataOptionClick(name: nushell.AtomicLiteralType, placeholder: string) {
      uiNodes = [...uiNodes, 
        { id: self.crypto.randomUUID(),
          type: 'data',
          position: { x: 0, y: 0 },
          data: {
            text: placeholder,
            literalType: name
          },
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
        onDataOptionClick={onDataOptionClick}
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
