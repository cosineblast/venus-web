
<script>
  let { onRunClick, text } = $props();

</script>

<div class="code">

  <div class="code-result pt-mono-regular">
    {#if text.type == 'ok'}
      {text.content}

    {:else if text.type == 'error'}
      <span class="error"> {text.content} </span>
    {/if}
  </div>

  <button class="run-button" onclick={onRunClick}>
    Run
  </button>
</div>

<style>

.code {
  padding: 5px;
  background-color: #282C34;
  color: white;
  font-size: 1.2em;

  display: flex;
  flex-direction: row;

  height: 100%;
}

.code-result {
  overflow: auto;
}

.run-button {
  margin-left: auto;
  font-size: 1.5em;
  margin-right: 15px;
  border: 2px solid aquamarine;
  padding: 5px;
  border-radius: 2px;
}

.error {
  color: #BE5046;
  font-weight: bold;
}

</style>
