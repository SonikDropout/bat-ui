const {
  SEPARATORS,
  IV_DATA,
  STATE_DATA,
  DATA_BYTE_LENGTH,
} = require('../constants');

function validate(buffer) {
  if (buffer.indexOf(SEPARATORS) != 0 || buffer.length !== DATA_BYTE_LENGTH)
    throw new Error('Invalid buffer recieved');
}

module.exports = function parse(buf) {
  validate(buf);
  const result = { iv: [], state: [] };
  let i = SEPARATORS.length;
  let checkSum = SEPARATORS.readUInt16BE(0) + SEPARATORS.readUInt16BE(2);
  for (let j = 0; j < IV_DATA.length; j++) {
    let val;
    if (!j) {
      val = buf.readUInt16BE(i) / 1000;
      val < 0.2 ? '0.00' : val.toFixed(2);
      checkSum += buf.readUInt16BE(i);
    } else if (j < 7) {
      val = (buf.readUInt16BE(i) / 1000).toFixed(2);
      checkSum += buf.readUInt16BE(i);
    } else if (j < 18) {
      val = (buf.readInt16BE(i) / 1000).toFixed(2);
      checkSum += buf.readInt16BE(i);
    } else {
      val = (buf.readUInt16BE(i) / 10).toFixed(1);
      checkSum += buf.readUInt16BE(i);
    }
    result.iv.push(val);
    i += 2;
  }
  for (let j = 0; j < STATE_DATA.length; j++) {
    checkSum += buf[i];
    if (j == STATE_DATA.indexOf('timeLimit')) result.state.push(buf[i++] * 10);
    else if (j == STATE_DATA.indexOf('voltageLimit')) result.state.push(buf[i++] / 10);
    else result.state.push(buf[i++]);
  }
  if (checkSum != buf.readUInt16BE(i)) {
    console.error(
      `Check sums don't match! Calculated: ${checkSum}, recieved: ${buf.readUInt16BE(
        i
      )}`
    );
  }
  return result;
};
