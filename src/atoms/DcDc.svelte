<script>
  export let style;
</script>

<div class="dc-dc" {style}>
  <span>DC</span>
  <div class="hr"></div>
  <span>DC</span>
</div>

<style>
  .dc-dc {
    border: 2px solid var(--text-color);
    border-radius: 4px;
    width: 6.4rem;
    height: 6.4rem;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    padding: 0.2rem;
    font-weight: bold;
  }

  .hr {
    width: 150%;
    border-bottom: 2px solid var(--text-color);
    transform: translateX(-1.5rem) rotate(-45deg);
  }

  span:first-child {
    align-self: flex-start;
  }

  span:last-child {
    align-self: flex-end;
  }
</style>
