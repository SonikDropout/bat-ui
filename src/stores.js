const { writable, derived } = require('svelte/store');
const { clone } = require('./utils/others');
const { DATA, COMMON_DATA, STATE_DATA } = require('./constants');
const { ipcRenderer } = require('electron');

const initialData = clone(DATA);

for (let key in initialData) initialData[key].value = 0;
for (let key in STATE_DATA) initialData[key] = 0;
for (let pos of [1, 2]) {
  initialData['power' + pos] = {
    symbol: 'P',
    units: 'Вт',
    value:
      initialData['current' + pos].value * initialData['voltage' + pos].value,
  };
}

const data = writable(initialData);
const connectionType = writable();

const summed = ['current', 'voltage', 'power', 'consumption'];

const commonData = derived(data, $data => {
  const d = {};
  for (const key in COMMON_DATA) d[key] = { ...$data[key] };
  for (let i = 0; i < summed.length; ++i) {
    const key = summed[i];
    d[key] = { ...$data[key + 1] };
    d[key].value = +($data[key + 1].value + $data[key + 2].value).toPrecision(4);
    d[key].symbol = d[key].symbol + '<sub>&#x2211;</sub>';
  }
  return d;
});

ipcRenderer.on('serialData', (e, d) => data.set(d));

module.exports = {
  data,
  connectionType,
  commonData,
};
