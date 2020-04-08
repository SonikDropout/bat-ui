const { writable, derived } = require('svelte/store');
const {
  IV_DATA,
  STATE_DATA,
  CONSTRAINTS,
  BATTERY_TYPES,
  DEBOUNCED_STATE_DATA,
} = require('./constants');
const { mergeKeysValues, getPercentage, debounce } = require('./utils/others');
const { ipcRenderer } = require('electron');

const initialData = ipcRenderer.sendSync('initialDataRequest');
const initialIV = mergeKeysValues(IV_DATA, initialData.iv);
const initialState = addCharge(
  mergeKeysValues(STATE_DATA, initialData.state),
  initialIV
);
let prevState = getDebouncedPart(initialState);

const IVData = writable(initialIV);
const stateData = writable(initialState);
const debouncedUpdateState = debounce(
  (newState) => stateData.update((state) => ({ ...state, ...newState })),
  3000
);

ipcRenderer.on('serialData', handleData);

function handleData(e, d) {
  const iv = mergeKeysValues(IV_DATA, d.iv);
  IVData.set(iv);
  const state = addCharge(mergeKeysValues(STATE_DATA, d.state), iv);
  const debouncedStatePart = getDebouncedPart(state);
  DEBOUNCED_STATE_DATA.forEach((key) => {
    delete state[key];
  });
  if (!isStatesEqual(state, prevState)) {
    prevState = debouncedStatePart;
    debouncedUpdateState(debouncedStatePart);
  }
  stateData.update((oldState) => ({ ...oldState, ...state }));
}

function isStatesEqual(newState, state) {
  return DEBOUNCED_STATE_DATA.reduce(
    (flag, key) => newState[key] === state[key] || flag,
    false
  );
}

function addCharge(state, iv) {
  if (state.type1)
    state.charge1 = getPercentage(
      iv.voltage1,
      CONSTRAINTS.batVoltage[state.type1]
    );
  if (state.type2)
    state.charge2 = getPercentage(
      iv.voltage2,
      CONSTRAINTS.batVoltage[state.type2]
    );
  return state;
}

function getDebouncedPart(state) {
  return DEBOUNCED_STATE_DATA.reduce((acc, key) => {
    acc[key] = state[key];
    return acc;
  }, {});
}

module.exports = {
  IVData,
  stateData,
};
