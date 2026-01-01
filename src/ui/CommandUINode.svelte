
<script lang="ts" module>

  type Parameter = {
      name: string,
      required: boolean,
      isSwitch: boolean
  };

  export type Data = {
    hasInput: boolean,
    label: string,
    parameters: Parameter[],

    // TODO: use functional data structure library
    selectedOptionalParameters: Set<string>,
    enabledSwitches: Set<string>
  };

</script>

<script lang="ts">
  import { Handle, Position, type NodeProps, type Node, useSvelteFlow } from '@xyflow/svelte';

  let { updateNodeData } = useSvelteFlow();

  let { id, data }: NodeProps<Node<Data>> = $props();

  let activeParameters = $derived(
    data.parameters.filter(parameter => parameter.required && !parameter.isSwitch)
    .map(parameter => parameter.name)
    .concat(
      data.parameters.filter(parameter => data.selectedOptionalParameters.has(parameter.name))
      .map(param => param.name))
  )

  let showingOptions = $state(false);

  // this is the special identifier for the input name.
  // TODO: make this a constant.

  let handleNames = $derived((data.hasInput ? ['$INPUT$'] : []).concat(activeParameters))

  let percentageStep = $derived(100 / (1 + handleNames.length));

  function onOpenOptionsClick() {
    showingOptions = true;
  }

  function onCloseOptionsClick() {
    showingOptions = false;
  }

  function onCheckboxChange(parameter: Parameter, checked: boolean) {

    const updatedSet = (set: Set<string>) => {
      const next = new Set(set)

      if (checked) {
        next.add(parameter.name);
      } else {
        next.delete(parameter.name);
      }

      return next;
    }

    const [newOptionalParameters, newEnabledSwitches] = parameter.isSwitch ?
      [data.selectedOptionalParameters, updatedSet(data.enabledSwitches)]
      : [updatedSet(data.selectedOptionalParameters), data.enabledSwitches]

    const newData: Data = {
      hasInput: data.hasInput,
      label: data.label,
      parameters: data.parameters,
      selectedOptionalParameters: newOptionalParameters,
      enabledSwitches: newEnabledSwitches
    };

    updateNodeData(id, newData);
  }

</script>

<div class="command-node">
  { data.label }

  {#if data.parameters.filter(parameter => !parameter.required).length > 0 }

    {#if !showingOptions}
    <button class="command-corner" onclick={onOpenOptionsClick}>
      ...
    </button>
    {:else}

    <flags-container>
      <flags-inner>
        <horizontal-section>
          <button onclick={onCloseOptionsClick} class="close-button">X</button>
          <span>flags</span>
       </horizontal-section>

        <flag-list>
          {#each data.parameters.filter(param => !param.required) as parameter}
            <checkbox-container>
              <input
                type="checkbox"
                onchange={event => onCheckboxChange(parameter, (event.target as HTMLInputElement).checked)}
              /> {parameter.name}
            </checkbox-container>
          {/each}
        </flag-list>
      </flags-inner>
    </flags-container>


    {/if}
  {/if}
</div>

{#each handleNames as handleName, i (handleName)}
<Handle type="target" id={handleName} position={Position.Top} style="left: {(i + 1) * percentageStep}%" />
{/each}

<Handle type="source" position={Position.Bottom} />

<style>

  .command-node {
    border: 1px solid black;
    border-radius: 3px;
    padding-left: 20px;
    padding-right: 20px;
    padding-top: 5px;
    padding-bottom: 5px;
    position: relative;
    background-color: white;
  }

  button.command-corner {
    display: none;
    bottom: 0;
    right: 5px;
    position: absolute;
    font-size: 0.8em;
  }

  flags-container {
    position: absolute;
    z-index: 200;
    padding: 2px;
    right: 15px;
    bottom: 12px;
  }

  
  div.command-node:hover button.command-corner {
    display: block;
  }

  

  flags-inner {
    position: absolute;
    font-size: 0.5em;
    border: 1px solid black;
    background-color: white;
    z-index: 200;
    padding: 2px;
    white-space: nowrap;
  }

  flag-list {
    display: flex;
    flex-direction: column;
    gap: 2px;
  }

  checkbox-container {
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: space-between;

  }

  horizontal-section {
    display: flex;
    border-bottom: 0.5px solid gray;
    margin-bottom: 2px;
  }

  horizontal-section *:last-child {
    flex-grow: 1;
    text-align: center;
  }

  button.close-button {
    color: black;
  }

  


</style>
