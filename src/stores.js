const { writable, derived } = require('svelte/store');
const { IV_DATA, STATE_DATA } = require('./constants');
const { mergeKeysValues } = require('./utils/others');
const { ipcRenderer } = require('electron');

const initialIV = Object.assign({}, ...IV_DATA.map(key => ({ [key]: 0 })));
const initialState = Object.assign(
  {},
  ...STATE_DATA.map(key => ({ [key]: 0 }))
);

initialState.charge1 = 0;
initialState.charge2 = 0;

const IVData = writable(initialIV);
const stateData = writable(initialState);

ipcRenderer.on('serialData', (e, d) => {
  IVData.set(mergeKeysValues(IV_DATA, d.iv));
  stateData.set(addCharge(mergeKeysValues(STATE_DATA, d.state)));
});

function addCharge(state) {
  state.charge1 = 50;
  state.charge2 = 50;
  return state;
}

module.exports = {
  IVData,
  stateData,
};
