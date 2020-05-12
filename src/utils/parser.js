const {
  SEPARATORS,
  IV_DATA,
  STATE_DATA,
  DATA_BYTE_LENGTH,
  PRECISION,
} = require('../constants');

function validate(buffer) {
  if (buffer.indexOf(SEPARATORS) != 0)
    throw new Error('Invalid buffer recieved');
}

module.exports = function parse(buf) {
  validate(buf);
  const result = { iv: [], state: [] };
  let i = SEPARATORS.length;
  for (let j = 0; j < IV_DATA.length; j++) {
    let val;
    if (j < 7) val = (buf.readUInt16BE(i) / 1000).toFixed(PRECISION[j]);
    else if (j < 20) val = (buf.redInt16BE(i) / 1000).toFixed(PRECISION[j]);
    else val = (buf.readUInt16BE(i) / 10).toFixed(PRECISION[j]);
    result.iv.push(val);
    i += 2;
  }
  for (let j = 0; j < STATE_DATA.length; j++) {
    result.state.push(buf[i++]);
  }
  return result;
};
