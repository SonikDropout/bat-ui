<script>
  import Select from '../molecules/Select';
  import Toggle from '../atoms/Toggle';
  import Button from '../atoms/Button';
  import SaveButton from '../organisms/SaveButton';
  import RangeInput from '../molecules/RangeInput';
  import { ipcRenderer } from 'electron';
  import Chart from 'chart.js';
  import configureChart from './chart.config';
  import { BATTERY_TYPES, COMMANDS, CONSTRAINTS } from '../constants';
  import { stateData, IVData, getValue } from '../stores';
  import { onMount } from 'svelte';
  import { __ } from '../utils/translations';
  export let onBack;

  onMount(() => {
    chart = new Chart(
      document.getElementById('chart').getContext('2d'),
      configureChart(points, {
        x: { label: $__('t, s') },
        y: {
          label: $__(modeOptions[selectedMode > 1 ? 1 : 2].symbol),
          max:
            CONSTRAINTS[selectedMode > 1 ? 'batCurrent' : 'batVoltage'][
              batteryType
            ][1],
        },
      })
    );
  });

  const modeOptions = [
    { label: 'select mode', value: 0 },
    { label: 'constant current', value: 1, symbol: 'I, A' },
    { label: 'constant voltage', value: 2, symbol: 'U, V' },
  ];

  const constraintOptions = [
    { label: 'voltage constraint', value: 0, symbol: 'U, V' },
    { label: 'time constraint', value: 1, symbol: 't, s' },
  ];

  let selectedMode = $stateData.mode6,
    selectedConstraint = $stateData.offMode6,
    offLimit = selectedConstraint
      ? $stateData.timeLimit
      : $stateData.voltageLimit,
    defaultLoad = $IVData.setLoad7,
    points = [],
    saveDisabled = true,
    isDrawing,
    unsubscribeData = () => {},
    unsubscribeStop = () => {},
    chart,
    chargeCapacity = 0,
    energyCapacity = 0,
    monitorTimeout,
    batteryType = $stateData.type1,
    offModeConstraint = selectedConstraint
      ? CONSTRAINTS.batVoltage[batteryType]
      : CONSTRAINTS.offTime,
    elapsed;

  stateData.subscribe((state) => {
    if (state.rebooted == 154) {
      ipcRenderer.send('serialCommand', COMMANDS.setLoad6(defaultLoad));
      ipcRenderer.send(
        'serialCommand',
        COMMANDS.setOffMode(selectedConstraint)
      );
      ipcRenderer.send(
        'serialCommand',
        selectedConstraint
          ? COMMANDS.setMinVoltage6(offLimit)
          : COMMANDS.setMaxTime6(offLimit)
      );
      ipcRenderer.send('serialCommand', COMMANDS.setMode6(selectedMode));
      ipcRenderer.send(
        'serialCommand',
        isDrawing ? COMMANDS.trunOn6 : COMMANDS.turnOff6
      );
    }
  });

  $: if ($stateData.type1 !== batteryType) {
    batteryType = $stateData.type1;
    chargeCapacity = 0;
    energyCapacity = 0;
    if (!selectedConstraint)
      offModeConstraint = CONSTRAINTS.batVoltage[batteryType];
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
    clearTimeout(monitorTimeout);
  }

  function startResearch() {
    ipcRenderer.send('serialCommand', COMMANDS.turnOn6);
    startDrawing();
    startLogging();
    subscribeData();
    monitorTimeout = setTimeout(monitorStop, 3000);
  }

  function startDrawing() {
    isDrawing = true;
  }

  function startLogging() {
    const fileName = 'Battery';
    const headers = [$__('time, s'), $__('U, V'), $__('I, A')];
    ipcRenderer.send('startFileWrite', fileName, headers);
    saveDisabled = false;
  }

  function stopDrawing() {
    points = [];
    isDrawing = false;
  }

  function subscribeData() {
    elapsed = 0;
    unsubscribeData = IVData.subscribe(getPoint);
  }

  function getPoint(data) {
    const current = +data.current6;
    const voltage = +data.voltage6;
    const point = {
      x: elapsed++,
      y: selectedMode > 1 ? current : voltage,
    };
    sumCapacity(current, voltage);
    sendToLogger([elapsed, voltage, current]);
    updateChart(point);
  }

  function sumCapacity(I, V) {
    chargeCapacity += I / 3600;
    energyCapacity += (I * V) / 3600;
  }

  function updateChart(p) {
    points.push(p);
    if (points.length > 1000) reducePointsAmount();
    chart.data.datasets[0].data = points;
    chart.update();
  }

  function reducePointsAmount() {
    points = points.filter((_, i) => i % 2);
  }

  function monitorStop() {
    unsubscribeStop();
    unsubscribeStop = stateData.subscribe((state) => {
      if (!state.startStop6 && state.rebooted != 154) {
        stopDrawing();
        unsubscribeData();
        unsubscribeStop();
      }
    });
  }

  function sendToLogger(row) {
    ipcRenderer.send('excelRow', row);
  }

  function selectMode(mode) {
    selectedMode = +mode;
    ipcRenderer.send('serialCommand', COMMANDS.setMode6(+mode));
    chart.options.scales.yAxes[0].scaleLabel.labelString = $__(
      modeOptions[selectedMode > 1 ? 1 : 2].symbol
    );
    chart.options.scales.yAxes[0].ticks.suggestedMax =
      CONSTRAINTS[selectedMode > 1 ? 'batCurrent' : 'batVoltage'][
        batteryType
      ][1];
    chart.update();
  }

  function setIV(val) {
    defaultLoad = val;
    ipcRenderer.send(
      'serialCommand',
      COMMANDS[selectedMode == 1 ? 'setCurrent6' : 'setLoad6'](val)
    );
  }

  function setOffMode(mode) {
    if (selectedConstraint !== +mode) {
      selectedConstraint = +mode;
      ipcRenderer.send('serialCommand', COMMANDS.setOffMode(+mode));
      changeOffMode();
    }
  }

  function changeOffMode() {
    if (selectedConstraint) {
      offModeConstraint = CONSTRAINTS.offTime;
      offLimit = $stateData.timeLimit;
    } else {
      offModeConstraint = CONSTRAINTS.batVoltage[batteryType];
      offLimit = $stateData.voltageLimit;
    }
  }

  function setConstraint(val) {
    offLimit = val;
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
  <header>{$__('study batteries characteristics')}</header>
  <main>
    <div class="label">{$__('battery type')}</div>
    <h3>
      {@html BATTERY_TYPES[$stateData.type1] ||
        $__('please connect to 7 channel')}
    </h3>
    <div class="label">{$__('study mode')}</div>
    <Select
      title={!$stateData.type1 ? $__('please connect the battery') : ''}
      disabled={isDrawing}
      style="grid-column: 1/ 5"
      options={modeOptions}
      defaultValue={selectedMode}
      onChange={selectMode}
    />
    {#if $stateData.type1}
      {#if selectedMode}
        <div class="label-inline">{$__(modeOptions[selectedMode].symbol)}</div>
        <RangeInput
          step={selectedMode > 1 ? 0.1 : 0.01}
          style="grid-column: 2 / 4"
          onChange={setIV}
          defaultValue={defaultLoad}
          range={CONSTRAINTS[selectedMode > 1 ? 'batVoltage' : 'batCurrent'][
            batteryType
          ]}
        />
      {:else}
        <div class="spacer-sm" />
      {/if}
      <div class="label">{$__('set constraints')}</div>
      <Select
        order={2}
        style="grid-column: 1 / 4"
        onChange={setOffMode}
        disabled={isDrawing}
        options={constraintOptions}
        defaultValue={selectedConstraint}
      />
      <div class="label-inline">
        {$__(constraintOptions[selectedConstraint].symbol)}
      </div>
      <RangeInput
        style="grid-column: 2 / 4"
        onChange={setConstraint}
        defaultValue={offLimit}
        step={selectedConstraint ? 10 : 0.1}
        range={offModeConstraint}
      />
    {:else}
      <div class="spacer" />
    {/if}
    <Button
      style="grid-column: 1 / 3; align-self: start"
      id="onoff"
      on:click={toggleResearch}
    >
      {isDrawing ? $__('stop') : $__('start')}
    </Button>
    <h4>{$__('obtained characteristics')}</h4>
    <div class="char-label">U, {$__('V')}</div>
    <div class="char-value">{$IVData.voltage6}</div>
    <div class="char-label second">Q, {$__('A*h')}</div>
    <div class="char-value second">
      {chargeCapacity > 0.001 ? chargeCapacity.toPrecision(3) : 0}
    </div>
    <div class="char-label">I, {$__('A')}</div>
    <div class="char-value">{$IVData.current6}</div>
    <div class="char-label second">E, {$__('W*h')}</div>
    <div class="char-value second">
      {energyCapacity > 0.001 ? energyCapacity.toPrecision(3) : 0}
    </div>
    <div class="thermo-module">
      <h4 class="thermo-title">{$__('study different temperatures')}</h4>
      <div class="thermo-controls">
        <div>{$__('thermo module')}</div>
        <span>
          T
          <sub>{$__('battery')}</sub>
          = {$IVData.temp1}&deg;C
        </span>
        <Toggle on:change={toggleFridge} />
        <span>
          T
          <sub>{$__('internal')}</sub>
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
      id="back"
    >
      {$__('back')}
    </Button>
    <SaveButton
      style="grid-area: 11 / 7 / 13 / 13; align-self: end"
      disabled={saveDisabled}
    />
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
