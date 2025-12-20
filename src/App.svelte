
<script lang="ts">
  import { match, P } from 'ts-pattern';
  import LeftBar from './lib/LeftBar.svelte';
  import CommandUINode from './lib/CommandUINode.svelte';
  import RunnerBar from './lib/RunnerBar.svelte'

  import { SvelteFlow, Background } from '@xyflow/svelte';

  import { CommandGraph } from './lib/graph.ts';

  import { CommandTree, SyntaxTree } from './lib/syntax.ts';

  import '@xyflow/svelte/dist/style.css';

  let runnerText = $state({ type: 'ok', content: ':v'});
 
  let uiNodes = $state.raw([
    {
      id: 'randomfloat',
      type: 'command',
      position: { x: 0, y: 0 },
      data: {
        label: 'random float',
        hasInput: false
      }
    },
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
      type: 'output'
    },
  ]);
 
  let uiEdges = $state.raw([
  ]);

  const nodeTypes = {
    command: CommandUINode
  };

  function run() {
    const graph = CommandGraph.commandGraphFromUIGraph(uiNodes, uiEdges);
    const commandTree = graph.toCommandTree();

    match(commandTree)
      .with({type: 'error'}, error => {
        runnerText = { type: 'error', content: error.message };
      })
      .with(P._, tree => {
        const syntaxTree = CommandTree.toSyntaxTree(tree);
        const source = SyntaxTree.toNushellSource(syntaxTree);

        console.log({ graph });
        console.log({ commandTree });
        console.log({ syntaxTree });
        console.log({ syntaxTree });
        console.log({ source });

        runnerText = { type: 'ok' , content: source};
      });
  }

</script>

<main>
  <LeftBar />

  <div class="right-container">

    <div class="canvas">
      
      <SvelteFlow
          bind:nodes={uiNodes}
          bind:edges={uiEdges}
          nodeTypes={nodeTypes}
          fitView>
        <Background />
      </SvelteFlow>

    </div>

    <RunnerBar
       text={runnerText}
       onRunClick={run} />
  </div>

</main>



<style>

  .canvas {
    flex-grow: 1;
  }

  .right-container {
    flex-grow: 1;
    display: flex;
    flex-direction: column;
  }

  main  {
    height: 100vh;
    display: flex;
  }
</style>
