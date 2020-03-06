const IS_RPI = process.platform === 'linux' && process.arch == 'arm';
const PORT = {
  name: IS_RPI ? '/dev/ttyS0' : 'COM5',
  baudRate: 230400,
};
const SEPARATORS = Buffer.alloc(4);
SEPARATORS.writeUInt16BE(1243);
SEPARATORS.writeUInt16BE(9524, 2);

const STATES = {
  initial: 'select',
  battery: 'battery',
  energy: 'energy',
};

const IV_DATA = [
  'busVoltage',
  Array.from({ length: 6 }, (_, i) => 'voltage' + (i + 1)),
  Array.from({ length: 5 }, (_, i) => [
    'currentIn' + (i + 1),
    'currentOut' + (i + 1),
  ]),
  'current6',
  'temp1',
  'temp2',
].flat(2);

const STATE_DATA = [
  'type1',
  'type2',
  'onoff1',
  'inout1',
  'onoff2',
  'inout2',
  'onoff3',
  'onoff4',
  'onoff5',
  'startStop6',
  'mode6',
  'offMode6',
];

const DATA_BYTE_LENGTH = IV_DATA.length * 2 + STATE_DATA.length + SEPARATORS.length;

const COMMANDS = {
  turnOff: [4, 0],
  turnOn1: [8, 0],
  turnOff1: [12, 0],
  charge1: [16, 0],
  discharge1: [20, 0],
  turnOn2: [24, 0],
  turnOff2: [28, 0],
  charge2: [32, 0],
  discharge2: [36, 0],
  turnOn3: [40, 0],
  turnOff3: [44, 0],
  turnOn4: [48, 0],
  turnOff4: [52, 0],
  turnOn5: [56, 0],
  turnOff5: [60, 0],
  turnOn6: [64, 0],
  turnOff6: [68, 0],
  setCurrent6: v => [72, 100 + v * 10],
  setVoltage6: v => [76, 100 + v * 10],
  setMinVoltage6: v => [80, 100 + v * 10],
  setMaxTime6: v => [84, v / 10],
  setVoltage5: v => [88, v * 10],
};

const BATTERY_TYPES = [
  'Не подключено',
  'LiPol',
  'LiFePO',
  'NiMH',
  'NiCd',
  'PbPbO',
  'LTO',
];

const VOLTAGE_CONSTRAINTS = {
  LiPol: [3.5, 4.2],
  LiFePО: [5.6, 6.6],
  NiCd: [4.0, 6.0],
  NiMH: [4.0, 6.0],
  PbPbO: [6.0, 7.0],
  LTO: [2.0, 2.4],
};

const CONSTRAINTS = {
  batCurrent: [0, 1],
  batVoltage: VOLTAGE_CONSTRAINTS,
  offVoltage: [2, 8],
  offTime: [10, 500],
  voltage: [12, 24],
};

const CHARGE_CURRENTS = {
  LiPol: 1,
  LiFePО: 0.35,
  NiCd: 0.35,
  NiMH: 0.35,
  PbPbO: 0.35,
  LTO: 1.5,
};

const MODES = [{ symbol: 'I, A' }, { symbol: 'U, B' }];

const OFF_MODES = ['U, B', 't, c'];

module.exports = {
  IS_RPI,
  PORT,
  SEPARATORS,
  STATES,
  IV_DATA,
  STATE_DATA,
  COMMANDS,
  BATTERY_TYPES,
  CONSTRAINTS,
  MODES,
  OFF_MODES,
  CHARGE_CURRENTS,
  DATA_BYTE_LENGTH,
};