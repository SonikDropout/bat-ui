const { STATE_DATA, IV_DATA, COMMANDS } = require('../constants');
const EventEmitter = require('events');

const serial = new EventEmitter();
const state = Array(STATE_DATA.length).fill(0);
const iv = Array(IV_DATA.length).fill(0);

let interval = setInterval(sendData, 1000);

function sendData() {
  serial.emit('data', { iv, state });
}

serial.sendCommand = function sendCommand(cmd) {
  console.info('Sending command to serial:', cmd);
  if (cmd[0] === COMMANDS.turnOn1[0]) {
    state[2] = 1;
    setTimeout(() => (state[2] = 0), 2000);
  }
};

serial.close = function close() {
  serial.removeAllListeners();
  clearInterval(interval);
};

module.exports = serial;
