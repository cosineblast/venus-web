
<script module lang="ts">

export type Command  = {
  name: string,
  category: string
}

</script>

<script lang="ts">

const { commands, category, onCategoryClick } = $props();

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

  <search-bar>
  </search-bar>



  {#if category == 'commands'}
    {#if commands != null}

    <command-list>

      {#each commands as command (command.name)}
        <command-item>
          <span> {command.name} </span>
          <span> {command.category} </span>
        </command-item>
      {/each}

    </command-list>

    {:else}

    Loading command list...

    {/if}
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
    display: block;
    overflow-y: auto;
    padding-left: 10px;
    padding-right: 10px;
  }

  command-item {
    display: flex;
    justify-content: space-between;

    margin-bottom: 4px;

    padding-left: 5px;
    padding-right: 5px;
    border-radius: 3px;

    border: 1px solid white;
    transition: border-color 0.1s;
  }

  command-item:hover {
    border: 1px solid black;
  }

  command-item > span:last-child {
    color: gray;
  }

</style>
