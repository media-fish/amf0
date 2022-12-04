import test from 'ava';
import {
  readValue,
  readAllValues,
  writeValue,
} from '../../index.js';

test('symbols', t => {
  t.is(typeof readValue, 'function');
  t.is(typeof readAllValues, 'function');
  t.is(typeof writeValue, 'function');
});

