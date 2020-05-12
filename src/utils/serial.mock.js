const { STATE_DATA, IV_DATA, COMMANDS } = require('../constants');
const EventEmitter = require('events');

const serial = new EventEmitter();
const state = Array(STATE_DATA.length).fill(0);
state[0] = 1;
setTimeout(() => (state[0] = 0), 5000);
setTimeout(() => (state[0] = 3), 7000);
const iv = Array(IV_DATA.length).fill(0);

let interval = setInterval(sendData, 1000);

function sendData() {
  serial.emit('data', { iv: iv.map((v) => v.toFixed(2)), state });
}

serial.sendCommand = function sendCommand(cmd) {
  console.info('Sending command to serial:', cmd);
  if (cmd[0] === COMMANDS.turnOn1[0]) {
    state[2] = 1;
    setTimeout(() => (state[2] = 0), 2000);
  }
  if (cmd[0] === 64) state[9] = 1;
  if (cmd[0] === 68) state[9] = 0;
};

serial.close = function close() {
  serial.removeAllListeners();
  clearInterval(interval);
};

module.exports = serial;
