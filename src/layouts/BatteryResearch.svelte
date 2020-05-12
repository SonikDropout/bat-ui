<script>
  import Select from '../molecules/Select';
  import Button from '../atoms/Button';
  import RangeInput from '../molecules/RangeInput';
  import { ipcRenderer } from 'electron';
  import Chart from 'chart.js';
  import zoom from 'chartjs-plugin-zoom';
  import configureChart from './chart.config';
  import {
    BATTERY_TYPES,
    COMMANDS,
    CONSTRAINTS,
    MODES,
    OFF_MODES,
  } from '../constants';
  import { stateData, IVData } from '../stores';
  import { onMount } from 'svelte';
  export let onBack;

  onMount(() => {
    chart = new Chart(
      document.getElementById('chart').getContext('2d'),
      configureChart(points, {
        x: 't, c',
        y: OFF_MODES[Math.abs(selectedMode - 2)] || 'I, A',
      })
    );
    chart.options.onClick = chart.resetZoom;
  });

  ipcRenderer.send('usbStorageRequest');
  ipcRenderer.on('usbConnected', () => (saveDisabled = false));
  ipcRenderer.on('usbDisconnected', () => (saveDisabled = true));

  const modeOptions = [
    { label: 'режим не выбран', value: 0 },
    { label: 'по постоянному току', value: 1 },
    { label: 'по постоянному напряжению', value: 2 },
  ];

  const constraintOptions = [
    { label: 'по напряжению', value: 0 },
    { label: 'по времени', value: 1 },
  ];

  let selectedMode = $stateData.mode6,
    selectedConstraint = $stateData.offMode6,
    points = [],
    saveDisabled = true,
    isDrawing,
    unsubscribeData = () => {},
    chart,
    chargeCapacity = 0,
    energyCapacity = 0,
    modeConstraint,
    timeStart;

  $: if (selectedMode == 2)
    modeConstraint = CONSTRAINTS.batVoltage[$stateData.type1];
  $: if (selectedMode == 1) modeConstraint = CONSTRAINTS.batCurrent;

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
    const fileName = '';
    const headers = [];
    ipcRenderer.send('startFileWrite', fileName, headers);
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
      1500
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
    const row = {
      x: (Date.now() - timeStart) / 1000,
      y: data[data.mode6 > 1 ? 'current6' : 'voltage6'],
    };
    sumCapacity(data.current6, data.voltage6);
    sendToLogger(Object.values(row));
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

  function saveFile() {
    ipcRenderer.send('saveFile');
  }

  function selectMode(mode) {
    selectedMode = +mode;
    ipcRenderer.send('serialCommand', COMMANDS.setMode6(+mode));
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
</script>

<div class="layout">
  <header>Исследование основных характеристик аккумуляторных батарей</header>
  <main>
    <div class="label">Исследуемый тип АКБ</div>
    <h3>{BATTERY_TYPES[$stateData.type1]}</h3>
    <div class="label">Режим исследования</div>
    <Select
      title={!$stateData.type1 ? 'Подключите батарею чтобы выбрать режим исследования' : ''}
      disabled={!$stateData.type1}
      style="grid-column: 1/ 5"
      options={modeOptions}
      defaultValue={selectedMode}
      onChange={selectMode} />
    {#if selectedMode}
      <div class="label-inline">{MODES[selectedMode - 1].symbol}</div>
      <RangeInput
        step={0.1}
        style="grid-column: 2 / 4"
        onChange={setIV}
        range={modeConstraint} />
    {:else}
      <div class="spacer" />
    {/if}
    <div class="label">Выставить ограничения</div>
    <Select
      order={2}
      style="grid-column: 1 / 4"
      onChange={setOffMode}
      options={constraintOptions}
      defaultValue={selectedConstraint} />
    <div class="label-inline">{OFF_MODES[selectedConstraint]}</div>
    <RangeInput
      style="grid-column: 2 / 4"
      onChange={setConstraint}
      step={selectedConstraint ? 10 : 0.1}
      range={CONSTRAINTS[selectedConstraint ? 'offTime' : 'offVoltage']} />
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
    <div class="chart">
      <canvas id="chart" height="400" width="640" />
    </div>
    <Button
      on:click={onBack}
      disabled={isDrawing}
      style="grid-area: 11 / 5 / 13 / 7; align-self: end"
      id="back">
      Назад
    </Button>
    <Button
      on:click={saveFile}
      id="save"
      style="grid-area: 11 / 7 / 13 / 13; align-self: end"
      disabled={saveDisabled}>
      Запись данных на usb-устройство
    </Button>
  </main>
</div>

<style>
  main {
    grid-template-rows: repeat(8, 3.2rem) repeat(2, 5rem) repeat(2, 3.2rem);
    grid-row-gap: 8px;
    line-height: 1;
  }
  .label,
  h4,
  h3,
  .spacer {
    grid-column: 1 / 5;
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
    grid-row: 1 / 11;
  }
</style>
