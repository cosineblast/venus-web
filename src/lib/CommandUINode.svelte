
<script lang="ts">
  import { Handle, Position, type NodeProps } from '@xyflow/svelte';

  let { data }: NodeProps = $props();
</script>

<div class="command-node">
  { data.label } ?
</div>

<!--
<Handle type="target" position={Position.Top} id="a" style="left: 80%" />
<Handle type="target" position={Position.Top} id="b" style="left: 20%" />
-->

{#if data.hasInput}
<Handle type="target" position={Position.Top} />
{/if}

<Handle type="source" position={Position.Bottom} />

<style>

  .command-node {
    border: 1px solid black;
    border-radius: 3px;
    padding-left: 20px;
    padding-right: 20px;
    padding-top: 5px;
    padding-bottom: 5px;
  }

</style>
