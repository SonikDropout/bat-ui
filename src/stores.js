const { writable, derived } = require('svelte/store');
const { IV_DATA, STATE_DATA, CONSTRAINTS } = require('./constants');
const { mergeKeysValues, getPercentage, debounce } = require('./utils/others');
const { ipcRenderer } = require('electron');

const initialData = ipcRenderer.sendSync('initialDataRequest');
const initialIV = mergeKeysValues(IV_DATA, initialData.iv);
const initialState = addCharge(
  mergeKeysValues(STATE_DATA, initialData.state),
  initialIV
);

const IVData = writable(initialIV);
const stateData = writable(initialState);

ipcRenderer.on('serialData', handleData);

function handleData(e, d) {
  const iv = mergeKeysValues(IV_DATA, d.iv);
  IVData.set(iv);
  stateData.set(addCharge(mergeKeysValues(STATE_DATA, d.state), iv));
}

function addCharge(state, iv) {
  if (state.type1)
    state.charge1 = getPercentage(
      +iv.voltage1,
      CONSTRAINTS.batVoltage[state.type1]
    );
  if (state.type2)
    state.charge2 = getPercentage(
      +iv.voltage2,
      CONSTRAINTS.batVoltage[state.type2]
    );
  return state;
}

function getValue(store) {
  let val;
  store.subscribe(($val) => (val = $val))();
  return val;
}

module.exports = {
  IVData,
  stateData,
  getValue
};
