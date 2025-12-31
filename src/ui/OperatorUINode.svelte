
<script lang="ts">
  import { Handle, Position, type NodeProps } from '@xyflow/svelte';

  type Data = {
    name: string,
  };

  let { data }: NodeProps = $props();
</script>

<div class="operator-node">
  { data.name }
</div>

<Handle type="target" position={Position.Top} id="A" style="left: 20%" />
<Handle type="target" position={Position.Top} id="B" style="left: 80%" />

<Handle type="source" position={Position.Bottom} />

<style>

  .operator-node {
    border: 1px solid black;
    border-radius: 3px;
    padding-left: 20px;
    padding-right: 20px;
    padding-top: 5px;
    padding-bottom: 5px;
  }

</style>
