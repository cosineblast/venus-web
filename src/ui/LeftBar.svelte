
<script module lang="ts">

import * as nushell from '../lib/nushell';

export type Command  = {
  name: string,
  category: string
}

</script>

<script lang="ts">

type Props = {
  commands: Command[] | null,
  category: 'commands' | 'data',
  onCategoryClick: (category: 'commands' | 'data') => void,
  onCommandClick: (index: number) => void,
  onDataOptionClick: (name: nushell.AtomicLiteralType, placeholder: string) => void,
  searchValue: unknown
}

let { commands, category, onCategoryClick, onCommandClick, onDataOptionClick, searchValue = $bindable() }: Props = $props();


const dataOptions: {name: nushell.AtomicLiteralType, placeholder: string}[] =  [
      {
        name: 'int',
        placeholder: '123'
      },
      {
        name: 'float',
        placeholder: '3.14'
      },
      {
        name: 'boolean',
        placeholder: 'true'
      },
      {
        name: 'string',
        placeholder: '"beep"'
      },
      {
        name: 'duration',
        placeholder: '2sec'
      },
      {
        name: 'filesize',
        placeholder: '10mb'
      },
      {
        name: 'datetime',
        placeholder: '1987-11-14'
      },
];
      
</script>

<aside>
  <!-- TODO: Use aria here -->

  <nav>
    <button onclick={() => onCategoryClick('commands')}> cmds </button>
    <button onclick={() => onCategoryClick('data')}> data </button>
  </nav>
    
  <header>
  {#if category == 'commands'}
    Commands
  {:else}
    Data
  {/if}
  </header>

  {#if category == 'commands'}
  <search-bar>
    <input type="text" placeholder="random int" bind:value={searchValue} />
  </search-bar>
  {/if}


  {#if category == 'commands'}
    {#if commands != null}

    <command-list>

      {#each commands as command, i (command.name)}
        <button onclick={() => onCommandClick(i)}>
          <span> {command.name} </span>
          <span> {command.category} </span>
        </button>
      {/each}

    </command-list>

    {:else}

    Loading command list...

    {/if}
  {/if}

  {#if category == 'data'}
    <command-list>
      
      {#each dataOptions as option (option.name)}
        <button onclick={() => onDataOptionClick(option.name, option.placeholder)}>
          <span> {option.name} </span>
          <span> {option.placeholder} </span>
        </button>
      {/each}
       

    </command-list>
  {/if}

</aside>

<style>
  aside  {
    height: 100vh;
    padding: 10px;
    display: flex;
    flex-direction: column;
  }


  nav {
    display: flex;
    justify-content: space-around;
    border-bottom: 1px solid black;
    margin-bottom: 10px;
  }

  nav > button {
    padding-bottom: 5px;
  }

  header {
    text-align: center;
  }

  command-list {
    display: flex;
    overflow-y: auto;
    padding-left: 10px;
    padding-right: 10px;
    flex-direction: column;
  }

  command-list > button {
    display: flex;
    justify-content: space-between;

    margin-bottom: 4px;

    padding-left: 5px;
    padding-right: 5px;
    border-radius: 3px;

    border: 1px solid white;
    transition: border-color 0.1s;
  }

  command-list > button:hover {
    border: 1px solid black;
  }

  command-list > button > span:last-child {
    color: gray;
  }

  search-bar {
    display: flex;
    border-bottom: 1px solid black;
    margin-bottom: 10px;
    padding-bottom: 10px;
  }

  search-bar > input {
    flex-grow: 1;
  }

</style>
