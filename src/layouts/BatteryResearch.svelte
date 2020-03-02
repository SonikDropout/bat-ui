<script>
  import Select from '../molecules/Select';
  import Button from '../atoms/Button';
  import RangeInput from '../molecules/RangeInput';
  import { ipcRenderer } from 'electron';
  import Chart from 'chart.js';
  import zoom from 'chartjs-plugin-zoom';
  import configureChart from './chart.config';
  import { BATTERY_TYPES, COMMANDS, CONSTRAINTS, MODES, OFF_MODES } from '../constants';
  import {stateData, IVData} from '../stores';
  import { onMount } from 'svelte';
  export let onBack;

  onMount(() => {
    chart = new Chart(
      document.getElementById('chart').getContext('2d'),
      configureChart(points, { x: '', y: '' })
    );
    chart.options.onClick = chart.resetZoom;
  });

  ipcRenderer.send('usbStorageRequest');
  ipcRenderer.on('usbConnected', () => (saveDisabled = false));
  ipcRenderer.on('usbDisconnected', () => (saveDisabled = true));

  const modeOptions = [
    { label: '-- выберете режим --', value: 0 },
    { label: 'по постоянному току', value: 1 },
    { label: 'по постоянному напряжению', value: 2 },
  ];

  const constraintOptions = [
    { label: 'по напряжению', value: 0 },
    { label: 'по времени', value: 1 },
  ];

  let 
    selectedMode = $stateData.mode6,
    selectedConstraint = $stateData.offMode6,
    points = [],
    saveDisabled = true,
    isDrawing,
    unsubscribeData,
    chart,
    timeStart;

  $: startDisabled = !selectedMode.value || !selectedType.value;

  function toggleDrawing() {
    if (isDrawing) {
      unsubscribeData();
      stopDrawing();
    } else {
      startLogging();
      subscribeData();
    }
    isDrawing = !isDrawing;
  }

  function startLogging() {
    const fileName = '';
    const headers = [];
    ipcRenderer.send('startFileWrite', fileName, headers);
  }

  function stopDrawing() {
    points = [];
  }

  function subscribeData() {
    timeStart = Date.now();
    unsubscribeData = commonData.subscirbe(d => {
      const row = { x: 0, y: 0 };
      sendToLogger(Object.values(row));
      updateChart(row);
    });
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
    selectedMode = mode;
  }

  function setIV(val) {
    ipcRenderer.send('serialCommand', COMMANDS[`set${selectedMode > 1 ? 'Voltage' : 'Current'}6`](val))
  }
  function setOffMode(mode) {
    selectedConstraint = mode;
  }
  function setConstraint(val) {
    ipcRenderer.send('serialCommand', COMMANDS[`set${val ? 'MaxTime' : 'MinVoltage'}6`](val))
  }
</script>

<div class="layout">
  <header>Исследование основных характеристик аккумуляторных батарей</header>
  <main>
    <div class="label">Исследуемый тип АКБ</div>
    <div class="bat-type">{BATTERY_TYPES[$stateData.type1 || $stateData.type2]}</div>
    <div class="label">Режим исследования</div>
    <Select options={modeOptions} defaultValue={selectedMode} onChange={selectMode} />
    {#if selectedMode}
    <div class="label-inline">{MODES[selectedMode].symbol}</div>
    <RangeInput onChange={setIV} range={CONSTRAINTS} />
    {/if}
    <div class="label">Выставить ограничения</div>
    <Select onChange={setOffMode} options={constraintOptions} defaultValue={selectedConstraint} />
    <div class="label-inline">{OFF_MODES[selectedConstraint]}</div>
    <RangeInput onChange={setConstraint} range={CONSTRAINTS} />
    <Button id="onoff" on:click={toggleDrawing}></Button>
    <h3>Полученные характеристики</h3>
    <div class="char-label">U, B</div>
    <div class="char-value">{$IVData.voltage2}</div>
    <div class="char-label">I, A</div>
    <div class="char-value">{$IVData.current2}</div>
    <div class="char-label">Q, мА*c</div>
    <div class="char-label">E, мВт*с</div>
    <div class="chart">
      <canvas id="chart" height="400" width="520" />
    </div>
    <Button on:click={onBack} id="back">Назад</Button>
    <Button on:click={saveFile} id="save" disabled={saveDisabled}>Запись данных на usb-устройство</Button>
  </main>
  <footer>
    <div class="save">
      <Button on:click={saveFile} disabled={saveDisabled}>
        Сохранить данные на USB-устройство
      </Button>
    </div>
  </footer>
</div>
