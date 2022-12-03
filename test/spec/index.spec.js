import test from 'ava';
import amf0 from '../../index.js';

test('symbols', t => {
  t.is(typeof amf0, 'object');
  t.truthy(amf0);
  const {
    readValue,
    readAllValues,
    writeValue,
  } = amf0;
  t.is(typeof readValue, 'function');
  t.is(typeof readAllValues, 'function');
  t.is(typeof writeValue, 'function');
});

