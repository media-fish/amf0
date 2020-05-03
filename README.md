[![Build Status](https://travis-ci.org/media-fish/amf0.svg?branch=master)](https://travis-ci.org/media-fish/amf0)
[![Coverage Status](https://coveralls.io/repos/github/media-fish/amf0/badge.svg?branch=master)](https://coveralls.io/github/media-fish/amf0?branch=master)
[![Dependency Status](https://david-dm.org/media-fish/amf0.svg)](https://david-dm.org/media-fish/amf0)
[![Development Dependency Status](https://david-dm.org/media-fish/amf0/dev-status.svg)](https://david-dm.org/media-fish/amf0#info=devDependencies)
[![Known Vulnerabilities](https://snyk.io/test/github/media-fish/amf0/badge.svg)](https://snyk.io/test/github/media-fish/amf0)
[![npm Downloads](https://img.shields.io/npm/dw/@mediafish/amf0.svg?style=flat-square)](https://npmjs.com/@mediafish/amf0)
[![XO code style](https://img.shields.io/badge/code_style-XO-5ed9c7.svg)](https://github.com/sindresorhus/xo)

# amf0

A library to read/write AMF0 binary format

## Install
[![NPM](https://nodei.co/npm/@mediafish/amf0.png?mini=true)](https://nodei.co/npm/@mediafish/amf0/)

## Usage

```js
const {readValue, writeValue} = require('@mediafish/amf0');


const buffer = Buffer.from([0xFF, 0xFF, 0xFF, 0x61, 0x62, 0x63]);

// Read AMF0
let offset, value, array = [];
while(offset < buffer.length) {
  [offset, value] = readValue(buffer, offset);
  console.log(JSON.stringify(value, null, 4);
  array.push(value);
}

// Write AMF0
offset = 0;
for (const item of array) {
  // First, pass null instead of a buffer to detect how many bytes are needed
  offset = writeValue(null, offset, item);
}

// And then alloc a buff
const dest = Buffer.alloc(offset);
for (const item of array) {
  // Write data actually to the buffer
  offset = writeValue(dest, offset, item);
}

```

## API

### `readValue(buffer, offset)`
Read data from the buffer

#### params
| Name     | Type    | Required | Default | Description   |
| -------- | ------- | -------- | ------- | ------------- |
| `buffer` | `Buffer` | Yes | N/A | The buffer from which the data is read |
| `offset` | number  | Yes      | N/A     | An integer to specify the position within the buffer |

#### return value
An array containing the following pair of values
| Index | Type   | Description  |
| ----- | ------ | ------------ |
| [0]   | number | An integer to indicate the position from which the next data should be read |
| [1]   | any | The read value |

### `writeValue(buffer, offset, value)`
Write data to the buffer

#### params
| Name     | Type    | Required | Default | Description   |
| -------- | ------- | -------- | ------- | ------------- |
| `buffer` | `Buffer` | Yes | N/A | The buffer to which the data is written |
| `offset` | number  | Yes      | N/A     | An integer to specify the position within the buffer |
| `value`  | any  | Yes      | N/A     | The data to be written to the buffer |

#### return value
An integer to indicate the position from which the next data should be read
