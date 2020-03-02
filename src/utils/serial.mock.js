const cbPoll = [];

function subscribe(fn) {
  cbPoll.push(fn);
}

let interval = setInterval(sendData, 1000);

function sendData() {
  cbPoll.forEach((cb) => cb(randomData()));
}

function randomData() {
  return [];
}

function sendCommand(cmd) {
  console.info('Sending command to serial:', cmd);
}

module.exports = {
  subscribe,
  sendCommand,
  unsubscribeAll() {
    clearInterval(interval);
  },
};
