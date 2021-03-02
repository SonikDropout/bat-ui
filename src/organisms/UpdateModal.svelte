<script>
  import { ipcRenderer } from 'electron';
  import Button from '../atoms/Button';
  import Spinner from '../atoms/Spinner';
  import {__} from '../utils/translations';
  let showModal = true,
    isUpdating,
    isError;
  ipcRenderer.on('updateError', err => {
    isError = true;
  });
  function startUpdate() {
    ipcRenderer.send('updateProgramm');
    isUpdating = true;
  }
  function closeModal() {
    showModal = false;
  }
</script>

{#if showModal}
  <div class="modal">
    <div class="modal-body">
      <h2>
        {#if isError}
          {$__('update failed')}
        {:else if isUpdating}
          {$__('updating')}
        {:else}{$__('update available')}{/if}
      </h2>
      {#if isError}
        <div class="buttons">
          <Button on:click={closeModal}>{$__('close')}</Button>
        </div>
      {:else if isUpdating}
        <Spinner size="lg" />
      {:else}
        <p>{$__('update?')}</p>
        <div class="buttons">
          <Button on:click={startUpdate}>{$__('yes')}</Button>
          <Button on:click={closeModal}>{$__('no')}</Button>
        </div>
      {/if}

    </div>
  </div>
{/if}

<style>
  .modal {
    position: fixed;
    top: 0;
    left: 0;
    bottom: 0;
    right: 0;
    display: flex;
    background-color: rgba(0, 0, 0, 0.6);
    z-index: 9004;
  }
  .modal-body {
    margin: auto;
    width: 50vw;
    height: 50vh;
    background-color: var(--bg-color);
    border-radius: 8px;
    padding: 4.8rem;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    text-align: center;
  }
  h2 {
    margin-bottom: auto;
  }
  .buttons {
    margin-top: 3rem;
  }
</style>
