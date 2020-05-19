<script>
  import { ipcRenderer } from 'electron';
  import { COMMANDS } from '../constants';
  import {fly} from 'svelte/transition';
  import { quintOut } from 'svelte/easing';
  import Button from '../atoms/Button';

  let showDialog = false;

  function startCalibration() {
    ipcRenderer.send('serialCommand', COMMANDS.calibrateVoltage);
    showDialog = false;
  }
</script>

<div on:click={() => (showDialog = true)} class="trigger" />
{#if showDialog}
  <div class="backdrop" on:click|self={() => (showDialog = false)}>
    <div class="dialog" transition:fly="{{y: -300, opacity: 0, easing: quintOut}}">
      <h3>Хотите отклабровать напряжение общей шины?</h3>
      <Button style="width:8rem" on:click={startCalibration}>Да</Button>
      <Button style="width:8rem" on:click={() => (showDialog = false)}>Нет</Button>
    </div>
  </div>
{/if}


<style>
  .trigger {
    position: fixed;
    top: 0;
    right: 0;
    width: 3rem;
    height: 3rem;
  }
  .backdrop {
    position: fixed;
    top: 0;
    bottom: 0;
    right: 0;
    left: 0;
    background-color: rgba(0,0,0,0.4);
    display: flex;
    z-index: 9001;
  }
  .dialog {
    background-color: var(--bg-color);
    padding: 2.4rem;
    margin: auto;
    border-radius: 8px;
    box-shadow: 0 0 5px black;
    text-align: center;
  }
  h3 {
    margin-bottom: 2.4rem;
  }
</style>
