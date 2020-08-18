const {
  SEPARATORS,
  IV_DATA,
  STATE_DATA,
  DATA_BYTE_LENGTH,
} = require('../constants');

function validate(buffer) {
  if (buffer.indexOf(SEPARATORS) != 0 /*|| buffer.length !== DATA_BYTE_LENGTH*/)
    throw new Error('Invalid buffer recieved');
}

module.exports = function parse(buf) {
  validate(buf);
  const result = { iv: [], state: [] };
  let i = SEPARATORS.length;
  for (let j = 0; j < IV_DATA.length; j++) {
    let val;
    if (!j) {
      val = buf.readUInt16BE(i) / 1000;
      val < 0.2 ? '0.00' : val.toFixed(2);
    } else if (j < 7) val = (buf.readUInt16BE(i) / 1000).toFixed(2);
    else if (j < 18) val = (buf.readInt16BE(i) / 1000).toFixed(2);
    else val = (buf.readUInt16BE(i) / 10).toFixed(1);
    result.iv.push(val);
    i += 2;
  }
  for (let j = 0; j < STATE_DATA.length; j++) {
    if (j == STATE_DATA.length - 2) result.state.push(buf[i++] * 10);
    else if (j == STATE_DATA.length - 1) result.state.push(buf[i++] / 10);
    else result.state.push(buf[i++]);
  }
  return result;
};
