<script>
  export let on;
  export let off;
  export let name;
  let checked;
</script>

<label>
  {off}
  <input class="hidden" type="checkbox" {name} bind:checked on:change />
  <span class="track" class:checked>
    <span class="thumb" />
  </span>
  {on}
</label>

<style>
  .track {
    border-radius: 2px;
    position: relative;
    width: 4rem;
    background-color: var(--corporate-grey);
  }

  .track.checked {
    background-color: var(--corporate-orange);
  }

  .thumb {
    display: block;
    background-color: var(--bg-color);
  }

  .track.checked > .thumb {
    transform: translateX(100%);
  }
</style>
