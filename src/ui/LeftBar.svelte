
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
  category: 'commands' | 'data' | 'operators',
  onCategoryClick: (category: 'commands' | 'data' | 'operators') => void,
  onCommandClick: (index: number) => void,
  onDataOptionClick: (name: nushell.AtomicLiteralType, placeholder: string) => void,
  onOperatorOptionClick: (name: nushell.Operator) => void,
  searchValue: unknown
}

let { commands, category, onCategoryClick, onCommandClick, onDataOptionClick, onOperatorOptionClick, searchValue = $bindable() }: Props = $props();


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

const operatorOptions: {name: nushell.Operator , placeholder: string}[] =  [
  { name: "+", placeholder: "Addition" },
  { name: "-", placeholder: "Subtraction" },
  { name: "*", placeholder: "Multiplication" },
  { name: "/", placeholder: "Division" },
  { name: "//", placeholder: "Floor division" },
  { name: "mod", placeholder: "Modulo" },
  { name: "**", placeholder: "Exponentiation (power)" },
  { name: "==", placeholder: "Equal" },
  { name: "!=", placeholder: "Not equal" },
  { name: "<", placeholder: "Less than" },
  { name: "<=", placeholder: "Less than or equal" },
  { name: ">", placeholder: "Greater than" },
  { name: ">=", placeholder: "Greater than or equal" },
  { name: "=~", placeholder: "Matches regex" },
  { name: "!~", placeholder: "Matchesn't regex" },
  { name: "in", placeholder: "Value in list" },
  { name: "not-in", placeholder: "Value not in list" },
  { name: "has", placeholder: "List has value" },
  { name: "not-has", placeholder: "List does not have value" },
  //{ name: "not", placeholder: "logical not" },
  { name: "and", placeholder: "Boolean and" },
  { name: "or", placeholder: "Boolean or" },
  { name: "xor", placeholder: "Boolean xor" },
  { name: "bit-or", placeholder: "Bitwise or" },
  { name: "bit-xor", placeholder: "Bitwise xor" },
  { name: "bit-and", placeholder: "Bitwise and" },
  { name: "bit-shl", placeholder: "Bitwise shift left" },
  { name: "bit-shr", placeholder: "Bitwise shift right" },
  { name: "starts-with", placeholder: "String starts with" },
  { name: "ends-with", placeholder: "String ends with" },
  { name: "++", placeholder: "Append lists" },
];
      
</script>

<aside>
  <!-- TODO: Use aria here -->
  <nav>
    <button onclick={() => onCategoryClick('commands')}> cmds </button>
    <button onclick={() => onCategoryClick('data')}> data </button>
    <button onclick={() => onCategoryClick('operators')}> operators </button>
  </nav>
    
  {#if category == 'commands'}
    <header> Commands </header>

    <search-bar>
      <input type="text" placeholder="random int" bind:value={searchValue} />
    </search-bar>

    {#if commands != null}

    <scroll-container>
      <command-list>

        {#each commands as command, i (command.name)}
          <button onclick={() => onCommandClick(i)}>
            <span> {command.name} </span>
            <span> {command.category} </span>
          </button>
        {/each}

      </command-list>
    </scroll-container>

    {:else}

    Loading command list...

    {/if}
  {/if}

  {#if category == 'data'}
    <header> Data </header>

    <scroll-container>
      <command-list>
        {#each dataOptions as option (option.name)}
          <button onclick={() => onDataOptionClick(option.name, option.placeholder)}>
            <span> {option.name} </span>
            <span> {option.placeholder} </span>
          </button>
        {/each}
      </command-list>

    </scroll-container>
  {/if}

  {#if category == 'operators'}
    <header> Operators </header>

    <scroll-container>

      <command-list>
      
        {#each operatorOptions as option (option.name)}
          <button onclick={() => onOperatorOptionClick(option.name)}>
            <span> {option.name} </span>
            <span> {option.placeholder} </span>
          </button>
        {/each}
      </command-list>
    </scroll-container>
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
    padding-left: 10px;
    padding-right: 10px;
    flex-direction: column;
  }

  scroll-container {
    overflow-y: auto;
  }

  command-list button {
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
    margin-bottom: 10px;
    padding-bottom: 10px;
  }

  search-bar > input {
    flex-grow: 1;
  }

  .bottom-border {
    border-bottom: 1px solid black;
    margin-bottom: 10px;
  }

</style>
