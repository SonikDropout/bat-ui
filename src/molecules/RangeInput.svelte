<script>
  export let range = [0, 100];
  export let disabled;
  export let onChange;
  export let name;
  export let defaultValue = range[0];
  export let type;
  export let style;
  export let step = 1;

  $: min = Math.min.apply(null, range);
  $: max = Math.max.apply(null, range);
  $: if (max < defaultValue) {
    onChange(max, name);
    defaultValue = max;
  }
  $: if (min > defaultValue) {
    onChange(min, name);
    defaultValue = min;
  }
  $: precision = -Math.min(+step.toExponential().split('e')[1], 0);
  $: value = defaultValue;

  let timeout,
    interval,
    showControls = false;

  function increment() {
    if (value + step <= max) {
      value = +(value + step).toFixed(precision);
    }
  }

  function decrement() {
    if (value - step >= min) {
      value = +(value - step).toFixed(precision);
    }
  }

  function stickyCall(fn) {
    fn();
    timeout = setTimeout(() => {
      fn();
      interval = setInterval(fn, 50);
    }, 500);
  }

  function pressIncrement(e) {
    stickyCall(increment);
    e.target.setPointerCapture(e.pointerId);
  }

  function pressDecrement(e) {
    stickyCall(decrement);
    e.target.setPointerCapture(e.pointerId);
  }

  function release(e) {
    if (timeout) clearTimeout(timeout);
    if (interval) clearInterval(interval);
    e.target.releasePointerCapture(e.pointerId);
    onChange(value, name);
  }
</script>

<span class="input-wrapper {type}" {style} class:disabled>
  <button
    disabled={value <= min || disabled}
    class="decrementer"
    on:pointerdown={pressDecrement}
    on:pointerup={release}>
    <span>-</span>
  </button>
  <span class="input">{value.toFixed(precision)}</span>
  <button
    disabled={value >= max || disabled}
    class="incrementer"
    on:pointerdown={pressIncrement}
    on:pointerup={release}>
    <span>+</span>
  </button>
</span>

<style>
  .input-wrapper {
    width: 16rem;
    border-radius: 4px;
    border: 1px solid var(--corporate-blue);
    height: 3.2rem;
    line-height: 3.2rem;
    display: flex;
    overflow: hidden;
    max-width: 100%;
  }
  .input-wrapper.disabled {
    opacity: 0.6;
  }
  .naked,
  .naked > * {
    border: none;
    background-color: transparent;
    color: inherit;
  }
  .naked {
    width: 12rem;
  }
  .input {
    flex-grow: 1;
    padding: 0 1rem;
    border: none;
    font-size: 2rem;
    text-align: center;
    display: inline-block;
  }
  button {
    border: none;
    background-color: transparent;
    width: 3.2rem;
    font-size: 2.4rem;
    line-height: 3.2rem;
    font-weight: 300;
    outline: none;
    background-color: var(--corporate-blue);
    color: var(--bg-color);
  }
  button:focus {
    outline: none;
  }
  button:disabled {
    opacity: 0.5;
  }
</style>
