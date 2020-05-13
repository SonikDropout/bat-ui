const parse = require('../parser');
const {SEPARATORS, IV_DATA, STATE_DATA} = require('../../constants');

test('parses buffer correctly', () => {
  let state = Buffer.alloc(STATE_DATA.length);
  let iv = Buffer.alloc(IV_DATA.length * 2);
  let testBuffer = Buffer.concat([SEPARATORS, iv, state]);
  let parsedBuffer = {
    iv: IV_DATA.map((_, i) => i < 20 ? '0.00' : '0.0'),
    state: Array(STATE_DATA.length).fill(0)
  }
  expect(JSON.stringify(parse(testBuffer))).toBe(JSON.stringify(parsedBuffer))
})