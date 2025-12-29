
<script lang="ts">
  import { Handle, Position, type NodeProps } from '@xyflow/svelte';

  let { data: _ }: NodeProps = $props();

</script>

<div class="command-node">
  Result
</div>

<Handle type="target" position={Position.Top} />

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
