<script>
  export let dir = 'both';
</script>

<div class="arrow-wrapper">
  <div class="arrow {dir}"></div>
</div>

<style>
  .arrow-wrapper {
    height: 24px;
    display: flex;
  }
  .arrow.both {
    width: 24px;
  }
  .arrow.both,
  .arrow.up {
    border-left: 2px solid var(--text-color);
  }
  .arrow.both,
  .arrow.down {
    border-right: 2px solid var(--text-color);
  }
  .arrow.both::before,
  .arrow.up::before {
    content: '';
    display: block;
    position: relative;
    left: -50%;
    border-left: 5px solid transparent;
    border-right: 5px solid transparent;
    border-bottom: 10px solid var(--text-color);
  }
  .arrow.both::after,
  .arrow.up::after {
    content: '';
    display: block;
    position: relative;
    left: 50%;
    border-left: 5px solid transparent;
    border-right: 5px solid transparent;
    border-top: 10px solid var(--text-color);
  }
</style>