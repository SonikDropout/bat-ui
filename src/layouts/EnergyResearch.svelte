<script>
  import Arrow from '../atoms/Arrow';
  import DcDc from '../atoms/DcDc';
  import Battery from '../molecules/Battery';
  import Switch from '../atoms/Switch';
  import RangeInput from '../molecules/RangeInput';
  export let onBack;
  import { IVData, stateData } from '../stores';

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

<header>Исследование по преобразованию энергии</header>

<main>
  <div class="bus">Общая шина U, B = {$IVData.busVoltage}</div>
  {#each channels as channel}
    <Arrow direction={channel.arrowDir} />
    <div class="current">I, A = {IVData['current' + channel.num]}</div>
    <Arrow direction={channel.arrowDir} />
    <DcDc />
    <Arrow direction={channel.arrowDir} />
    {#if channel.type == 'inout'}
      <Battery
        type={$stateData['type' + channel.num]}
        voltage={$IVData['voltage' + channel.num]}
        current={$IVData['current' + channel.num]} />
      <Switch on="заряд" off="разряд" on:change={switchModes} />
      <Switch on="вкл" off="выкл" on:change={switchModes} />
    {:else if channel.type == 'input'}
      <div class="input-iv">
        <div>U, B = {$IVData['voltage' + channel.num]}</div>
        <div>I, A = {$IVData['current' + channel.num]}</div>
      </div>
      <div class="input-icons" />
      <Switch on="вкл" off="выкл" on:change={switchModes} />
    {:else if channel.type == 'output'}
      <div class="set-voltage">
        Задать напряжение 12-24В
        <RangeInput type="naked" range={[12, 24]} onChange={setOutputVoltage} />
      </div>
      <Switch on="вкл" off="выкл" on:change={switchModes} />
    {/if}
  {/each}
  <div class="input-iv">
    <div>U, B = {$IVData.voltage6}</div>
    <div>I, A = {$IVData.current6}</div>
  </div>
  <Arrow direction="up" />
  <img class="icon" alt="fruit" src="../static/icons/fruit.svg" />
  <Switch on="вкл" off="выкл" on:change={switchModes} />
</main>
