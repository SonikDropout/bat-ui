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
    height: 24px;
    display: flex;
    text-align: center;
    font-size: 20px;
    line-height: 1;
    font-family: Arial sans-serif;
  }
</style>
