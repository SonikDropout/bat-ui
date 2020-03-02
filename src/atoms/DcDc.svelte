<div class="dc-dc">
  <span>DC</span>
  <hr>
  <span>DC</span>
</div>

<style>
  .dc-dc {
    border: 2px solid var(--text-color);
    border-radius: 4px;
    width: 6rem;
    height: 6rem;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    padding: 1.6rem .8rem;
    font-weight: bold;
  }

  hr {
    border-bottom: 2px solid var(--text-color);
    transform: rotate(45deg);
  }

  span:first-child {
    align-self: flex-start;
  }

  span::last-child {
    align-self: flex-end;
  }
</style>