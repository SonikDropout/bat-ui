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
  'current6'
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
  'onoff6',
  'mode6',
  'offMode6',
]

const COMMANDS = {
  turnOff: 4,
  turnOn1: 8,
  turnOff1: 12,
  charge1: 16,
  discharge1: 20,
  turnOn2: 24,
  turnOff2: 28,
  charge2: 32,
  discharge2: 36,
  turnOn3: 40,
  turnOff3: 44,
  turnOn4: 48,
  turnOff4: 52,
  turnOn5: 56,
  turnOff5: 60,
  turnOn6: 64,
  turnOff6: 68,
  setCurrent6: v => [72, 100 + v * 10],
  setVoltage6: v => [76, 100 + v * 10],
  setMinVoltage6: v => [80, 100 + v * 10],
  setMaxTime6: v => [84, v / 10],
  setVoltage5: v => [88, v * 10],
};

const BATTERY_TYPES = [
  '-- не подключено --',
  'LiPo',
  'LiFe',
  'NiMh',
  'NiCd',
  'PbO',
  'C',
]

const CONSTRAINTS = {
  voltage: [],
  current: []
}

const MODES = [
  {symbol: 'I, A'},
  {symbol: 'U, B'},
]

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
  OFF_MODES
};
