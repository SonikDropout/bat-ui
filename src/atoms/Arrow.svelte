<script>
  export let direction = 'inout';
  export let style;
</script>

<div class="arrow" {style}>
{#if (/in/).test( direction)}
  &uarr;
{/if}
{#if (/out/).test( direction)}
  &darr;
{/if}
</div>

<style>
  .arrow {
    height: 2.4rem;
    display: flex;
    text-align: center;
    font-size: 2rem;
    line-height: 1;
    font-weight: bold;
  }
</style>
