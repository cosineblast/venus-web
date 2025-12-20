
<script lang="ts">
  import LeftBar from './lib/LeftBar.svelte';
  import CommandUINode from './lib/CommandUINode.svelte';

  import { SvelteFlow, Background } from '@xyflow/svelte';

  import { CommandGraph } from './lib/graph.ts';

  import { CommandTree } from './lib/syntax.ts';
 
  import '@xyflow/svelte/dist/style.css';
 
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
    { id: 'aaa',
      source: 'randomfloat',
      target: 'mathsqrt',
    },
  ]);

  const nodeTypes = {
    command: CommandUINode
  };

  function run() {

    const graph = CommandGraph.commandGraphFromUIGraph(uiNodes, uiEdges);

    const commandTree = graph.toCommandTree();

    const syntaxTree = CommandTree.toSyntaxTree(commandTree);
    
    console.log({ graph });
    console.log({ commandTree });
    console.log({ syntaxTree });
  }

</script>

<main>
  <LeftBar />

  <section class="canvas">
    <SvelteFlow
        bind:nodes={uiNodes}
        bind:edges={uiEdges}
        nodeTypes={nodeTypes}
        fitView>
      <Background />
    </SvelteFlow>

    <button class="run-button" onclick={run}>
      Run
    </button>
  </section>


</main>



<style>

  .canvas {
    flex-grow: 1;
  }

  main  {
    height: 100vh;
    display: flex;
  }

  .run-button {
    position: absolute;
    right: 0px;
    bottom: 0px;
    margin-right: 40px;
    margin-bottom: 40px;
    font-size: 1.5em;
    border-radius: 10px;
    border: 1px solid black;
    padding-left: 20px;
    padding-right: 20px;
  }
</style>
