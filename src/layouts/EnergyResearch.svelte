<script>
  import Arrow from '../atoms/Arrow';
  import DcDc from '../atoms/DcDc';
  import Button from '../atoms/Button';
  import Battery from '../molecules/Battery';
  import Switch from '../atoms/Switch';
  import RangeInput from '../molecules/RangeInput';
  export let onBack;
  import { IVData, stateData, getValue } from '../stores';
  import { BATTERY_TYPES, COMMANDS } from '../constants';
  import { ipcRenderer } from 'electron';

  const channels = [
    { arrowDir: 'both', num: 1, type: 'inout' },
    { arrowDir: 'both', num: 2, type: 'inout' },
    { arrowDir: 'up', num: 3, type: 'input' },
    { arrowDir: 'up', num: 4, type: 'input' },
    { arrowDir: 'down', num: 5, type: 'output' },
  ];

  const initialIV = getValue(IVData);

  function toggleChannel(e) {
    ipcRenderer.send(
      'serialCommand',
      COMMANDS[
        e.target.checked ? 'turnOn' + e.target.name : 'turnOff' + e.target.name
      ]
    );
  }

  function toggleChannelMode(e) {
    ipcRenderer.send(
      'serialCommand',
      COMMANDS[
        e.target.checked
          ? 'charge' + e.target.name
          : 'discharge' + e.target.name
      ]
    );
  }

  function setOutputVoltage(v) {
    ipcRenderer.send('serialCommand', COMMANDS.setVoltage5(v));
  }
</script>

<div class="layout">
  <header>Исследование по преобразованию и коммутации энергии</header>

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
          type={$stateData['type' + num]}
          voltage={$IVData['voltage' + num]}
          current={$IVData['currentIn' + num]} />
        <Switch
          name={num}
          checked={!!$stateData[`onoff${num}`]}
          on="вкл"
          off="выкл"
          on:change={toggleChannel}
          style="grid-area: sw-{num}" />
        <Switch
          checked={!!$stateData['inout' + num]}
          name={num}
          on="заряд"
          off="разряд"
          on:change={toggleChannelMode}
          style="grid-area: sw-2-{num}" />
      {:else if type == 'input'}
        <div class="input-iv" style="grid-area: iv-{num}">
          <div>U, B = {$IVData['voltage' + num]}</div>
          <div>I, A = {$IVData['currentIn' + num]}</div>
        </div>
        <div class="input-icons" style="grid-area: ico-{num}">
          <img
            src="../app/icons/fuelCell.svg"
            style="height: 36px"
            alt="fuelCell" />
          <img src="../app/icons/solar.svg" alt="solar" />
          <img src="../app/icons/battery.svg" alt="battery" />
        </div>
        <Switch
          name={num}
          checked={$stateData['onoff' + num]}
          on="вкл"
          off="выкл"
          on:change={toggleChannel}
          style="grid-area: sw-{num}" />
      {:else if type == 'output'}
        <div class="set-voltage" style="grid-area: v-{num}">
          Задать напряжение
          <RangeInput
            style="margin: 0 auto"
            type="naked"
            step={0.1}
            range={[12, 24]}
            defaultValue={+initialIV.voltage5}
            onChange={setOutputVoltage} />
          <strong>I, A = {$IVData.currentIn5}</strong>
          <strong>U, B = {$IVData.voltage5}</strong>
        </div>
        <Arrow direction="output" style="grid-area: ico-5; align-self: start;" />
        <img
          class="lamp"
          style="grid-area: ico-5"
          src="../app/icons/lamp.svg"
          alt="lamp" />
        <Switch
          name={num}
          on="вкл"
          checked={$stateData['onoff' + num]}
          off="выкл"
          on:change={toggleChannel}
          style="grid-area: sw-{num}" />
      {/if}
    {/each}
    <div class="input-iv" style="grid-area: iv-6">
      <div>U, B = {$IVData.voltage7}</div>
    </div>
    <Arrow direction="input" style="grid-area: ico-6" />
    <img
      class="fruit"
      alt="fruit"
      src="../app/icons/fruit.svg"
      style="grid-area: ico-6" />
    <Button on:click={onBack} style="grid-area:back">Назад</Button>
  </main>
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
      'bat-1 bat-2 . . v-5 ico-6'
      '. . ico-3 ico-4 ico-5 ico-6'
      'sw-1 sw-2 sw-3 sw-4 ico-5 sw-6'
      'sw-2-1 sw-2-2 . . sw-5 back';
    grid-template-rows: 3.2rem 24px 3.2rem 24px 6.4rem 24px repeat(3, 6.4rem) repeat(
        2,
        4rem
      );
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
  .current,
  .input-iv {
    font-weight: 700;
    text-align: center;
  }
  .current {
    height: 3.2rem;
    line-height: 3.2rem;
  }
  .input-iv {
    align-self: stretch;
    display: flex;
    flex-direction: column;
    justify-content: space-evenly;
  }
  .input-icons img {
    height: 3.2rem;
  }
  .fruit {
    height: 6.4rem;
    align-self: center;
  }
  .lamp {
    height: 6.4rem;
    align-self: end;
    margin-bottom: 1.6rem;
  }
  .set-voltage {
    text-align: center;
  }
  strong {
    margin-bottom: 0.8rem;
    display: block;
  }
</style>
