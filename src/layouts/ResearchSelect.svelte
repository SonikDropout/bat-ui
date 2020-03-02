<script>
  import { STATES } from '../constants';
  import { slide } from '../transitions';
  const slideLeft = slide('left');
  const slideRight = slide('right');
</script>

<main>
  <label class="area" transition:slideLeft>
    <img src="../static/icons/energy.svg" alt="temperature" />
    <p>Исследование по преобразованию и коммутации энергии</p>
    <input type="radio" name="appState" value={STATES.energy} on:change />
  </label>
  <label class="area" transition:slideRight>
    <img src="../static/icons/battery.svg" alt="temperature" />
    <p>Исследовани основных характеристик аккумуляторных батарей</p>
    <input type="radio" name="appState" value={STATES.battery} on:change />
  </label>
</main>

<style>
  main {
    width: 100vw;
    height: 100vh;
    display: grid;
    grid-template-columns: repeat(12, 1fr);
    grid-column-gap: 24px;
    padding: 0 24px;
    align-items: center;
  }
  input {
    position: absolute;
    top: -9999px;
    left: -9999px;
    visibility: hidden;
  }
  label {
    font-size: 2.4rem;
    font-family: 'Oswald', 'Franklin Gothic Medium', 'Arial Narrow', Arial,
      sans-serif;
    color: var(--bg-color);
    text-align: center;
    border-radius: 12px;
    padding: 3.2rem 8rem;
  }
  label img {
    width: 60%;
    display: block;
    margin: 0 auto;
  }
  .area:first-child {
    background-color: var(--corporate-orange);
    grid-column: 2 / 6;
  }
  .area:last-child {
    grid-column: 8 / 12;
    background-color: var(--corporate-blue);
  }
</style>
