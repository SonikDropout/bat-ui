<script>
  import { BATTERY_TYPES } from '../constants';
  export let current;
  export let voltage;
  export let type;
  export let charge = 0;
  export let style;
  export let temperature;
  $: if (!type) charge = 0;
</script>

<div class="box" {style}>
  <div class="tip" />
  <div
    class="battery"
    style="background: linear-gradient(to top, #1aa2dd 0 {charge}%, white {charge}%
    100%)">
    <div class="chars">
      {#if type}
        <span>U, B = {voltage}</span>
        <span>I, A = {current}</span>
        <span>
          {@html BATTERY_TYPES[type]}
        </span>
        <span>T, &deg;C = {temperature}</span>
      {:else}
        <img src="../app/icons/cross.svg" alt="cross" />
        <span class="noop">н/д</span>
      {/if}
    </div>
  </div>
</div>

<style>
  .chars {
    height: 100%;
    display: flex;
    flex-direction: column;
    justify-content: space-evenly;
    font-weight: bold;
  }
  .battery {
    border: 2px solid var(--text-color);
    border-radius: 4px;
    width: 12rem;
    height: 14rem;
    padding: 1rem 0.4rem;
    position: relative;
  }
  .tip {
    margin: 0 auto;
    border-radius: 2px 2px 0 0;
    border: 2px solid var(--text-color);
    border-bottom: none;
    width: 32px;
    height: 8px;
  }
  span {
    white-space: nowrap;
    display: block;
  }
  span.noop {
    text-align: center;
  }
  img {
    position: absolute;
    bottom: -1rem;
    right: -1rem;
    height: 5rem;
  }
</style>
