import {Buffer} from 'node:buffer';
import test from 'ava';
import amf0 from '../../amf0.js';

test('Number', t => {
  const values = [
    55_555,
    0.005,
    0,
    -0.005,
    -55_555,
  ];
  let offset = 0;
  for (const value of values) {
    offset = amf0.writeValue(null, offset, value);
  }

  const buf = Buffer.alloc(offset);
  offset = 0;
  for (const value of values) {
    offset = amf0.writeValue(buf, offset, value);
  }

  offset = 0;
  for (const expected of values) {
    const [next, value] = amf0.readValue(buf, offset);
    t.is(next, offset + 9);
    t.is(value, expected);
    offset = next;
  }
});

test('Boolean', t => {
  const values = [
    true,
    false,
  ];
  let offset = 0;
  for (const value of values) {
    offset = amf0.writeValue(null, offset, value);
  }

  const buf = Buffer.alloc(offset);
  offset = 0;
  for (const value of values) {
    offset = amf0.writeValue(buf, offset, value);
  }

  offset = 0;
  for (const expected of values) {
    const [next, value] = amf0.readValue(buf, offset);
    t.is(next, offset + 2);
    t.is(value, expected);
    offset = next;
  }
});

test('String', t => {
  const values = [
    {value: 'abc', length: 6},
    {value: '\u30d0\u30a4\u30ca\u30ea\u30c7\u30fc\u30bf\u306e\u914d\u5217', length: 33},
    {value: '', length: 3},
  ];
  let offset = 0;
  for (const {value} of values) {
    offset = amf0.writeValue(null, offset, value);
  }

  const buf = Buffer.alloc(offset);
  offset = 0;
  for (const {value} of values) {
    offset = amf0.writeValue(buf, offset, value);
  }

  offset = 0;
  for (const {value: expected, length: len} of values) {
    const [next, value] = amf0.readValue(buf, offset);
    t.is(next, offset + len);
    t.is(value, expected);
    offset = next;
  }
});

test('Object', t => {
  const values = [
    {value: {
      num: -0.005,
      boolern: false,
      singleByteStr: 'abc',
      multiByteStr: '\u30d0\u30a4\u30ca\u30ea\u30c7\u30fc\u30bf\u306e\u914d\u5217',
      nullValue: null,
      undefValue: undefined,
    }, length: 122},
    {value: {}, length: 4},
  ];
  let offset = 0;
  for (const {value} of values) {
    offset = amf0.writeValue(null, offset, value);
  }

  const buf = Buffer.alloc(offset);
  offset = 0;
  for (const {value} of values) {
    offset = amf0.writeValue(buf, offset, value);
  }

  offset = 0;
  for (const {value: expected, length: len} of values) {
    const [next, value] = amf0.readValue(buf, offset);
    t.is(next, offset + len);
    t.deepEqual(value, expected);
    offset = next;
  }
});

test('Array', t => {
  const values = [
    {value: [
      -0.005,
      false,
      'abc',
      '\u30d0\u30a4\u30ca\u30ea\u30c7\u30fc\u30bf\u306e\u914d\u5217',
      null,
      undefined,
    ], length: 72},
    {value: [], length: 8},
  ];
  let offset = 0;
  for (const {value} of values) {
    offset = amf0.writeValue(null, offset, value);
  }

  const buf = Buffer.alloc(offset);
  offset = 0;
  for (const {value} of values) {
    offset = amf0.writeValue(buf, offset, value);
  }

  offset = 0;
  for (const {value: expected, length: len} of values) {
    const [next, value] = amf0.readValue(buf, offset);
    t.is(next, offset + len);
    t.deepEqual(value, expected);
    offset = next;
  }
});

test('Date', t => {
  const date = new Date();
  const values = [
    {value: date, length: 11},
  ];
  let offset = 0;
  for (const {value} of values) {
    offset = amf0.writeValue(null, offset, value);
  }

  const buf = Buffer.alloc(offset);
  offset = 0;
  for (const {value} of values) {
    offset = amf0.writeValue(buf, offset, value);
  }

  offset = 0;
  for (const {value: expected, length: len} of values) {
    const [next, value] = amf0.readValue(buf, offset);
    t.is(next, offset + len);
    t.is(value.getTime(), expected.getTime());
    offset = next;
  }
});
