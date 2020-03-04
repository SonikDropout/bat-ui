<script>
  import Arrow from '../atoms/Arrow';
  import DcDc from '../atoms/DcDc';
  import Button from '../atoms/Button';
  import Battery from '../molecules/Battery';
  import Switch from '../atoms/Switch';
  import RangeInput from '../molecules/RangeInput';
  export let onBack;
  import { IVData, stateData } from '../stores';
  import { BATTERY_TYPES } from '../constants';

  const channels = [
    { arrowDir: 'both', num: 1, type: 'inout' },
    { arrowDir: 'both', num: 2, type: 'inout' },
    { arrowDir: 'up', num: 3, type: 'input' },
    { arrowDir: 'up', num: 4, type: 'input' },
    { arrowDir: 'down', num: 5, type: 'output' },
  ];

  function switchModes(e) {
    const { name, cheched } = e.target;
  }

  function setOutputVoltage(v) {}
</script>

<div class="layout">
  <header>Исследование по преобразованию энергии</header>

  <main>
    <div class="bus">Общая шина U, B = {$IVData.busVoltage}</div>
    {#each channels as { type, num }}
      <Arrow direction={type} style="grid-area: ar-1-{num}" />
      <div class="current" style="grid-area: i-{num}">
        I, A = {$IVData['currentOut' + num]}
      </div>
      <Arrow direction={type} style="grid-area: ar-2-{num}" />
      <DcDc style="grid-area: dc-{num}" />
      <Arrow direction={type} style="grid-area: ar-3-{num}" />
      {#if type == 'inout'}
        <Battery
          style="grid-area: bat-{num}"
          temperature={$IVData['temp' + num]}
          charge={$stateData['charge' + num]}
          type={BATTERY_TYPES[$stateData['type' + num]]}
          voltage={$IVData['voltage' + num]}
          current={$IVData['currentIn' + num]} />
        <Switch
          on="заряд"
          off="разряд"
          on:change={switchModes}
          style="grid-area: sw-{num}" />
        <Switch
          on="вкл"
          off="выкл"
          on:change={switchModes}
          style="grid-area: sw-2-{num}" />
      {:else if type == 'input'}
        <div class="input-iv" style="grid-area: iv-{num}">
          <div>U, B = {$IVData['voltage' + num]}</div>
          <div>I, A = {$IVData['currentIn' + num]}</div>
        </div>
        <div class="input-icons" style="grid-area: ico-{num}">
          <img
            src="../static/icons/fuelCell.svg"
            style="height: 36px"
            alt="fuelCell" />
          <img src="../static/icons/solar.svg" alt="solar" />
          <img src="../static/icons/battery.svg" alt="battery" />
        </div>
        <Switch
          on="вкл"
          off="выкл"
          on:change={switchModes}
          style="grid-area: sw-{num}" />
      {:else if type == 'output'}
        <div class="set-voltage" style="grid-area: v-{num}">
          Задать напряжение <br> 12-24В
          <RangeInput
            style="margin: 0 auto"  
            type="naked"
            range={[12, 24]}
            onChange={setOutputVoltage} />
        </div>
        <Switch
          on="вкл"
          off="выкл"
          on:change={switchModes}
          style="grid-area: sw-{num}" />
      {/if}
    {/each}
    <div class="input-iv" style="gird-area: iv-6">
      <div>U, B = {$IVData.voltage6}</div>
      <div>I, A = {$IVData.current6}</div>
    </div>
    <Arrow direction="output" style="grid-area: iv-6" />
    <img
      class="icon"
      alt="fruit"
      src="../static/icons/fruit.svg"
      style="grid-area: ico-6" />
    <Switch
      on="вкл"
      off="выкл"
      on:change={switchModes}
      style="grid-area: sw-6" />
  </main>
  <footer>
    <Button on:click={onBack}>Назад</Button>
  </footer>
</div>

<style>
  main {
    grid-template-columns: repeat(6, 142px);
    grid-template-areas:
      'bus bus bus bus bus .'
      'ar-1-1 ar-1-2 ar-1-3 ar-1-4 ar-1-5 .'
      'i-1 i-2 i-3 i-4 i-5 .'
      'ar-2-1 ar-2-2 ar-2-3 ar-2-4 ar-2-5 .'
      'dc-1 dc-2 dc-3 dc-4 dc-5 .'
      'ar-3-1 ar-3-2 ar-3-3 ar-3-4 ar-3-5 .'
      'bat-1 bat-2 iv-3 iv-4 v-5 iv-6'
      'bat-1 bat-2 ico-3 ico-4 ico-5 ico-6'
      'sw-1 sw-2 sw-3 sw-4 ico-5 ico-6'
      'sw-2-1 sw-2-2 . . sw-5 sw-6';
    justify-items: center;
    align-items: start;
  }
  .bus {
    justify-self: stretch;
    grid-area: bus;
    border-bottom: 4px solid;
    text-align: center;
    font-size: 2.4rem;
  }
  .current,
  .input-iv,
  .set-voltage {
    border: 2px solid;
    border-radius: 4px;
    justify-self: stretch;
  }
  .current {
    height: 30px;
    line-height: 30px;
    text-align: center;
  }
  .input-icons img {
    height: 3.2rem;
  }
  .icon {
    height: 6rem;
  }
  .set-voltage {
    text-align: center;
  }
</style>
