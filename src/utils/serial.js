const Serial = require('serialport');
const { PORT, SEPARATORS } = require('../constants');
const parse = require('./parser');

const serial = new Serial(PORT.name, { baudRate: PORT.baudRate });

serial.on('data', handleData);

let subscribers = [];
const buffer = Buffer.alloc(50);
let offset = 0;

function handleData(buf) {
  if (buf.toString('ascii').startsWith('ok')) buf = buf.slice(2);
  idx = buf.indexOf(SEPARATORS);
  if (idx != -1) {
    buf.copy(buffer, offset, 0, idx);
    try {
      subscribers.forEach(fn => fn(parse(buffer.slice())));
    } catch (e) {
      console.error('There is a hole in your logic:', e);
    }
    offset = 0;
    buf.copy(buffer, offset, idx);
    offset = buf.length;
  } else {
    buf.copy(buffer, offset);
    offset += buf.length;
  }
}

function subscribe(fn) {
  subscribers.push(fn);
}

let commandQueue = [];
let portBusy = false;

function sendCommand(bytes) {
  let [byte1, byte2] = isNaN(bytes) ? bytes : [bytes, 0];
  commandQueue.push(Buffer.from([30, byte1, byte2, byte1 + byte2 + 30]));
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
  serial.write(cmd);
  serial.once('data', buf => {
    if (!buf.toString('ascii').startsWith('ok')) {
      commandQueue.unshift(cmd);
      writeCommandFromQueue();
    }
  });
}

function unsubscribeAll() {
  subscribers = [];
  if (serial.isOpen) serial.close();
}

module.exports = {
  subscribe,
  sendCommand,
  unsubscribeAll,
};
