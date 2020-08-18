<script>
  import Select from '../molecules/Select';
  import Toggle from '../atoms/Toggle';
  import Button from '../atoms/Button';
  import SaveButton from '../organisms/SaveButton';
  import RangeInput from '../molecules/RangeInput';
  import { ipcRenderer } from 'electron';
  import Chart from 'chart.js';
  import zoom from 'chartjs-plugin-zoom';
  import configureChart from './chart.config';
  import { BATTERY_TYPES, COMMANDS, CONSTRAINTS } from '../constants';
  import { stateData, IVData, getValue } from '../stores';
  import { onMount } from 'svelte';
  export let onBack;

  onMount(() => {
    chart = new Chart(
      document.getElementById('chart').getContext('2d'),
      configureChart(points, {
        x: { label: 't, c' },
        y: {
          label: modeOptions[selectedMode > 1 ? 1 : 2].symbol,
          max:
            CONSTRAINTS[selectedMode > 1 ? 'batCurrent' : 'batVoltage'][
              batteryType
            ][1],
        },
      })
    );
    console.log(
      CONSTRAINTS[selectedMode > 1 ? 'batVoltage' : 'batCurrent'][
        batteryType
      ][1]
    );
    chart.options.onClick = chart.resetZoom;
  });

  const modeOptions = [
    { label: 'режим не выбран', value: 0 },
    { label: 'по постоянному току', value: 1, symbol: 'I, A' },
    { label: 'по постоянному напряжению', value: 2, symbol: 'U, B' },
  ];

  const constraintOptions = [
    { label: 'по напряжению', value: 0, symbol: 'U, B' },
    { label: 'по времени', value: 1, symbol: 't, c' },
  ];

  let selectedMode = $stateData.mode6,
    selectedConstraint = $stateData.offMode6,
    offLimit = selectedConstraint
      ? $stateData.timeLimit
      : $stateData.voltageLimit,
    points = [],
    saveDisabled = true,
    isDrawing,
    unsubscribeData = () => {},
    chart,
    chargeCapacity = 0,
    energyCapacity = 0,
    modeConstraint,
    offModeConstraint,
    batteryType,
    timeStart;

  stateData.subscribe(state => {
    if (state.type1 !== batteryType) batteryType = state.type1;
  });

  $: if (selectedConstraint) {
    offModeConstraint = CONSTRAINTS.offTime;
    offLimit = $stateData.timeLimit;
  } else {
    offModeConstraint = CONSTRAINTS.batVoltage[batteryType] || [3, 6];
    offLimit = $stateData.voltageLimit;
  }

  $: startDisabled = !$stateData.type1 || !selectedMode.value;

  function toggleResearch() {
    if (isDrawing) {
      stopResearch();
    } else {
      startResearch();
    }
  }

  function stopResearch() {
    ipcRenderer.send('serialCommand', COMMANDS.turnOff6);
    unsubscribeData();
    stopDrawing();
  }

  function startResearch() {
    ipcRenderer.send('serialCommand', COMMANDS.turnOn6);
    startDrawing();
    startLogging();
    subscribeData();
  }

  function startDrawing() {
    isDrawing = true;
    chargeCapacity = 0;
    energyCapacity = 0;
  }

  function startLogging() {
    const fileName = 'Battery';
    const headers = ['Время, с', 'U, B', 'I, A'];
    ipcRenderer.send('startFileWrite', fileName, headers);
    saveDisabled = false;
  }

  function stopDrawing() {
    points = [];
    isDrawing = false;
  }

  function subscribeData() {
    timeStart = Date.now();
    const unsubscribeIV = IVData.subscribe(getPoint);
    let unsubscribeState = Function.prototype;
    setTimeout(
      () => (unsubscribeState = stateData.subscribe(monitorStop)),
      2500
    );
    unsubscribeData = () => {
      unsubscribeIV();
      unsubscribeState();
    };
  }

  function monitorStop(state) {
    if (!state.startStop6) {
      stopDrawing();
      unsubscribeData();
    }
  }

  function getPoint(data) {
    const current = +data.current6;
    const voltage = +data.voltage6;
    const elapsed = Math.round((Date.now() - timeStart) / 1000);
    const row = {
      x: elapsed,
      y: selectedMode > 1 ? current : voltage,
    };
    sumCapacity(current, voltage);
    sendToLogger([elapsed, voltage, current]);
    updateChart(row);
  }

  function sumCapacity(I, V) {
    chargeCapacity += I / 3600;
    energyCapacity += (I * V) / 3600;
  }

  function updateChart(p) {
    points.push(p);
    chart.data.datasets[0].data = points;
    chart.update();
  }

  function sendToLogger(row) {
    ipcRenderer.send('excelRow', row);
  }

  function selectMode(mode) {
    selectedMode = +mode;
    ipcRenderer.send('serialCommand', COMMANDS.setMode6(+mode));
    chart.options.scales.yAxes[0].scaleLabel.labelString =
      modeOptions[selectedMode > 1 ? 1 : 2].symbol;
    chart.options.scales.yAxes[0].ticks.suggestedMax =
      CONSTRAINTS[selectedMode > 1 ? 'batCurrent' : 'batVoltage'][
        batteryType
      ][1];
    chart.update();
  }

  function setIV(val) {
    ipcRenderer.send('serialCommand', COMMANDS.setLoad6(val));
  }
  function setOffMode(mode) {
    selectedConstraint = +mode;
    ipcRenderer.send('serialCommand', COMMANDS.setOffMode(+mode));
  }
  function setConstraint(val) {
    ipcRenderer.send(
      'serialCommand',
      COMMANDS[`set${selectedConstraint ? 'MaxTime' : 'MinVoltage'}6`](val)
    );
  }
  function toggleFridge(e) {
    // ipcRenderer.send(
    //   'serialCommand',
    //   COMMANDS[`turn${e.target.checked ? 'On' : 'Off'}Fridge`]
    // );
  }
</script>

<div class="layout">
  <header>Исследование основных характеристик аккумуляторных батарей</header>
  <main>
    <div class="label">Исследуемый тип АКБ</div>
    <h3>
      {@html BATTERY_TYPES[$stateData.type1] || 'Подключите батарею к 7 каналу'}
    </h3>
    <div class="label">Режим исследования</div>
    <Select
      title={!$stateData.type1 ? 'Подключите батарею чтобы выбрать режим исследования' : ''}
      disabled={!$stateData.type1}
      style="grid-column: 1/ 5"
      options={modeOptions}
      defaultValue={selectedMode}
      onChange={selectMode} />
    {#if $stateData.type1}
      {#if selectedMode}
        <div class="label-inline">{modeOptions[selectedMode].symbol}</div>
        <RangeInput
          step={0.1}
          style="grid-column: 2 / 4"
          onChange={setIV}
          range={CONSTRAINTS[selectedMode > 1 ? 'batVoltage' : 'batCurrent'][batteryType]} />
      {:else}
        <div class="spacer-sm" />
      {/if}
      <div class="label">Выставить ограничения</div>
      <Select
        order={2}
        style="grid-column: 1 / 4"
        onChange={setOffMode}
        options={constraintOptions}
        defaultValue={selectedConstraint} />
      <div class="label-inline">
        {constraintOptions[selectedConstraint].symbol}
      </div>
      <RangeInput
        style="grid-column: 2 / 4"
        onChange={setConstraint}
        defaultValue={offLimit}
        step={selectedConstraint ? 10 : 0.1}
        range={offModeConstraint} />
    {:else}
      <div class="spacer" />
    {/if}
    <Button
      style="grid-column: 1 / 3; align-self: start"
      id="onoff"
      on:click={toggleResearch}>
      {isDrawing ? 'Стоп' : 'Старт'}
    </Button>
    <h4>Полученные характеристики</h4>
    <div class="char-label">U, B</div>
    <div class="char-value">{$IVData.voltage6}</div>
    <div class="char-label second">Q, А*ч</div>
    <div class="char-value second">
      {chargeCapacity > 0.001 ? chargeCapacity.toPrecision(3) : 0}
    </div>
    <div class="char-label">I, A</div>
    <div class="char-value">{$IVData.current6}</div>
    <div class="char-label second">E, Вт*ч</div>
    <div class="char-value second">
      {energyCapacity > 0.001 ? energyCapacity.toPrecision(3) : 0}
    </div>
    <div class="thermo-module">
      <h4 class="thermo-title">
        Исследование характеристик АКБ при различных тепературах
      </h4>
      <div class="thermo-controls">
        <div>Модуль термостатирования</div>
        <span>
          T
          <sub>АКБ</sub>
          = {$IVData.temp1}&deg;C
        </span>
        <Toggle on:change={toggleFridge} />
        <span>
          T
          <sub>внутр</sub>
          = {$IVData.temp2}&deg;C
        </span>
      </div>
    </div>
    <div class="chart">
      <canvas id="chart" height="350" width="640" />
    </div>
    <Button
      on:click={onBack}
      disabled={isDrawing}
      style="grid-area: 11 / 5 / 13 / 7; align-self: end"
      id="back">
      Назад
    </Button>
    <SaveButton
      style="grid-area: 11 / 7 / 13 / 13; align-self: end"
      disabled={saveDisabled}>
      Запись данных на usb-устройство
    </SaveButton>
  </main>
</div>

<style>
  main {
    grid-template-rows: repeat(8, 3.2rem) repeat(2, 5rem) repeat(2, 3.2rem);
    grid-row-gap: 0.8rem;
    line-height: 1;
  }
  .label,
  h4,
  h3,
  .spacer,
  .spacer-sm {
    grid-column: 1 / 5;
  }
  .spacer {
    grid-row: span 4;
  }
  h3 {
    text-align: left;
  }
  .label {
    align-self: end;
  }
  .label-inline {
    grid-column: 1 / 2;
    align-self: center;
  }
  .char-label {
    grid-column: 1 / 2;
    white-space: nowrap;
  }
  .char-value {
    white-space: nowrap;
    grid-column: 2 / 3;
  }
  h4,
  .char-label,
  .char-value {
    align-self: end;
  }
  .char-value {
    font-weight: bold;
  }
  .char-label.second {
    grid-column: 3 / 4;
  }
  .char-value.second {
    grid-column: 4 / 5;
  }
  .chart {
    align-self: end;
    grid-column: 5 / 13;
    grid-row: 3 / 11;
  }
  .thermo-module {
    grid-column: 6 / 12;
    grid-row: 1 / 3;
  }
  .thermo-title {
    text-align: left;
    margin-bottom: 1.6rem;
  }
  .thermo-controls {
    display: grid;
    grid-template-columns: 60% 40%;
    grid-template-rows: repeat(2, auto);
  }
</style>
