const Serial = require('serialport');
const { PORT, SEPARATORS } = require('../constants');
const EventEmitter = require('events');
const parse = require('./parser');

const serial = new Serial(PORT.name, { baudRate: PORT.baudRate });
const emitter = new EventEmitter();

serial.on('data', handleData);

let buffer = Buffer.from([]);

function handleData(buf) {
  if (buf.toString('ascii').startsWith('ok')) buf = buf.slice(2);
  idx = buf.indexOf(SEPARATORS);
  if (idx != -1) {
    buffer = Buffer.concat([buffer, buf.slice(0, idx)]);
    try {
      emitter.emit('data', parse(buffer));
    } catch (e) {
      // console.error('There is a hole in your logic:', e);
    }
    buffer = buf.slice(idx);
  } else {
    buffer = Buffer.concat([buffer, buf]);
  }
}

let commandQueue = [];
let portBusy = false;

function sendCommand([byte1, byte2], cb = () => {}) {
  commandQueue.push(Buffer.from([20, byte1, byte2, byte1 + byte2 + 20]));
  if (!portBusy) {
    portBusy = true;
    writeCommandFromQueue();
  }
}

function writeCommandFromQueue() {
  if (!commandQueue.length) {
    portBusy = false;
    return;
  }
  const cmd = commandQueue.shift();
  console.log('Sending command to serial:', cmd);
  serial.write(cmd);
  serial.once('data', (buf) => {
    console.log('Recieved answer:', buf.toString('ascii'));
    if (!buf.toString('ascii').startsWith('ok')) {
      commandQueue.unshift(cmd);
    }
    writeCommandFromQueue();
  });
}

emitter.close = function close() {
  emitter.removeAllListeners();
  if (serial.isOpen) serial.close();
};

emitter.sendCommand = sendCommand;

module.exports = emitter;
