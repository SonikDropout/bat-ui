<script>
  import { STATES } from '../constants';
  import { slide } from '../transitions';
  const slideLeft = slide('left');
  const slideRight = slide('right');
</script>

<main>
  <label class="area" transition:slideLeft>
    <img src="../app/icons/energy.svg" alt="energy" />
    <p>Исследование по преобразованию и коммутации энергии</p>
    <input type="radio" class="hidden" name="appState" value={STATES.energy} on:change />
  </label>
  <label class="area" transition:slideRight>
    <img src="../app/icons/battery.svg" alt="battery" class="bat-icon"/>
    <p>Исследовани основных характеристик аккумуляторных батарей</p>
    <input type="radio" class="hidden" name="appState" value={STATES.battery} on:change />
  </label>
</main>

<style>
  main {
    width: 100vw;
    height: 100vh;
    align-items: center;
  }
  label {
    font-size: 2.4rem;
    font-family: 'Oswald', 'Franklin Gothic Medium', 'Arial Narrow', Arial,
      sans-serif;
    color: var(--bg-color);
    text-align: center;
    border-radius: 12px;
    padding: 3.2rem 4rem;
  }
  label img {
    height: 120px;
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
  img.bat-icon {
    filter: brightness(100);
  }
</style>
