const { writable, derived } = require('svelte/store');
const { IV_DATA, STATE_DATA } = require('./constants');
const { ipcRenderer } = require('electron');

const initialIV = Object.assign({}, ...IV_DATA.map(key => ({ [key]: 0 })));
const initialState = Object.assign(
  {},
  ...STATE_DATA.map(key => ({ [key]: 0 }))
);

initialState.charge1 = 50;

const IVData = writable(initialIV);
const stateData = writable(initialState);

ipcRenderer.on('serialData', (e, d) => {});

module.exports = {
  IVData,
  stateData,
};
