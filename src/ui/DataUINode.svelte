
<script lang="ts">
  import { Handle, Position, type Node, type NodeProps, useSvelteFlow } from '@xyflow/svelte';
  import * as nushell from '../lib/nushell';

  let { id, data }: NodeProps<Node<NodeData>> = $props();

  let { updateNodeData } = useSvelteFlow();

  type NodeData  = {
    text: string,
    literalType: nushell.AtomicLiteralType
  };

</script>

<div class="data-node">
  
  <input
        id="text"
        name="text"
        value={data.text}
        oninput={(evt) => {
          updateNodeData(id, { text: (evt.target as any).value });
        }}
        class="nodrag"
      />

  <info-section>
      <div> {data.literalType} </div>

      {#await nushell.literalIsOk(data.text, data.literalType)}
        <check-loading>...</check-loading>
      {:then isOk } 
        {#if !isOk}
          <error-warning> !!! </error-warning>
        {/if}
      {/await}
  </info-section>

</div>

<Handle type="source" position={Position.Bottom} />

<style>

  input {
    width: 100px;
    text-align: center;
  }

  .data-node {
    border: 1px solid black;
    border-radius: 5px;
    padding-left: 5px;
    padding-right: 5px;
    padding-top: 5px;
    padding-bottom: 5px;
    display: flex;
    flex-direction: column;
    align-items:center;
  }

  info-section {
    display: flex;
    font-size: 0.5em;
    width: 100%;
    justify-content: center;

    position: relative;
  }

  info-section > error-warning {
    position: absolute;
    right: 3px;
    color: red;
  }

  info-section > check-loading {
    position: absolute;
    right: 3px;
  }

</style>
