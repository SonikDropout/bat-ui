<script>
  export let current;
  export let voltage;
  export let type;
  export let charge;
  export let style;
  export let temperature;
</script>

<div class="box" {style}>
  <div class="tip" />
  <div
    class="battery"
    style="background: linear-gradient(to top, #1aa2dd 0 {charge}%, white {charge}%
    100%)">
    <div class="chars" style="background-image:linear-gradient(to bottom, #333 0 {100-charge}%, white {100-charge}%
    100%)">
      U, B = {voltage} <br>
      I, A = {current} <br>
      {type} <br>
      T, &deg;C = {temperature} <br>
    </div>
  </div>
</div>

<style>
  .chars {
    -webkit-background-clip: text;
    background-clip: text;
    -webkit-text-fill-color: transparent;
    height: 100%;
  }
  .battery {
    border: 2px solid var(--text-color);
    border-radius: 4px;
    width: 9rem;
    height: 12rem;
  }
  .tip {
    margin: 0 auto;
    border-radius: 2px 2px 0 0;
    border: 2px solid var(--text-color);
    border-bottom: none;
    width: 24px;
    height: 8px;
  }
</style>
