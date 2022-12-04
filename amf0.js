import {reader, writer} from '@mediafish/buffer-operator';

function readValue(buffer, offset) {
  let marker = 0;
  [offset, marker] = reader.readNumber(buffer, offset, 1);
  // console.log(`[AMF0] type=${marker}`);
  switch (marker) {
    case 0x00: // number-marker
      return readNumber(buffer, offset);
    case 0x01: // boolean-marker
      return readBoolean(buffer, offset);
    case 0x02: // string-marker
      return readString(buffer, offset);
    case 0x03: // object-marker
      return readObject(buffer, offset);
    case 0x05: // null-marker
      return readNull(buffer, offset);
    case 0x06: // undefined-marker
      return readUndefined(buffer, offset);
    case 0x08: // ecma-array-marker
      return readEcmaArray(buffer, offset);
    case 0x09: // object-end-marker
      return readObjectEnd(buffer, offset);
    case 0x0B: // date-marker
      return readDate(buffer, offset);
    case 0x0C: // long-string-marker
      return readLongString(buffer, offset);
    case 0x04: // movieclip-marker
    case 0x07: // reference-marker
    case 0x0A: // strict-array-marker
    case 0x0D: // unsupported-marker
    case 0x0E: // recordset-marker
    case 0x0F: // xml-document-marker
    case 0x10: // typed-object-marker
    default:
      console.error(`[AMF0] Unsupported type: ${marker}`);
  }
  return [offset];
}

function readNumber(buffer, offset) {
  // console.log(`readNumber(buffer.length=${buffer.length}, offset=${offset})`);
  const value = buffer.readDoubleBE(offset);
  return [offset + 8, value];
}

function readBoolean(buffer, offset) {
  // console.log(`readBoolean(buffer.length=${buffer.length}, offset=${offset})`);
  let value = 0;
  [offset, value] = reader.readNumber(buffer, offset, 1);
  return [offset, value !== 0];
}

function readString(buffer, offset) {
  // console.log(`readString(buffer.length=${buffer.length}, offset=${offset})`);
  let length = 0, value = '';
  [offset, length] = reader.readNumber(buffer, offset, 2);
  // console.log(`\tlength=${length}`);
  [offset, value] = reader.readString(buffer, offset, length);
  return [offset, value];
}

function readLongString(buffer, offset) {
  // console.log(`readLongString(buffer.length=${buffer.length}, offset=${offset})`);
  let length = 0, value = '';
  [offset, length] = reader.readNumber(buffer, offset, 4);
  [offset, value] = reader.readString(buffer, offset, length);
  return [offset, value];
}

function readObject(buffer, offset, readArray = false) {
  // console.log(`readObject(buffer.length=${buffer.length}, offset=${offset}, readArray=${readArray})`);
  const ret = readArray ? [] : {};
  let property = '', value = null;
  while (true) {
    [offset, property] = readString(buffer, offset);
    if (!property && buffer[offset] === 0x09) {
      offset++; // object-end-marker
      break;
    }
    if (!property && offset === buffer.length) {
      break;
    }
    [offset, value] = readValue(buffer, offset);
    if (readArray) {
      ret.push(value);
    } else {
      ret[property] = value;
    }
  }
  return [offset, ret];
}

function readNull(buffer, offset) {
  // console.log(`readNull(buffer.length=${buffer.length}, offset=${offset})`);
  return [offset, null];
}

function readUndefined(buffer, offset) {
  // console.log(`readUndefined(buffer.length=${buffer.length}, offset=${offset})`);
  return [offset];
}

function readObjectEnd(buffer, offset) {
  // console.log(`readObjectEnd(buffer.length=${buffer.length}, offset=${offset})`);
  return [offset];
}

function readEcmaArray(buffer, offset) {
  // console.log(`readEcmaArray(buffer.length=${buffer.length}, offset=${offset})`);
  let ret = null;
  [offset] = reader.readNumber(buffer, offset, 4);
  [offset, ret] = readObject(buffer, offset, true);
  return [offset, ret];
}

function readDate(buffer, offset) {
  // console.log(`readDate(buffer.length=${buffer.length}, offset=${offset})`);
  let millisec = 0;
  [offset, millisec] = readNumber(buffer, offset);
  [offset] = reader.readNumber(buffer, offset, 2); // Unused timezone
  return [offset, new Date(millisec)];
}

function readAllValues(buffer, offset) {
  const values = [];
  let value;
  while (offset < buffer.length) {
    [offset, value] = readValue(buffer, offset);
    if (value === undefined) {
      continue;
    }
    values.push(value);
  }
  return values;
}

function writeValue(buffer, offset, value) {
  if (value === null) {
    return writeNull(buffer, offset);
  }
  if (value === undefined) {
    return writeUndefined(buffer, offset);
  }
  if (typeof value === 'number') {
    return writeNumber(buffer, offset, value);
  }
  if (typeof value === 'boolean') {
    return writeBoolean(buffer, offset, value);
  }
  if (typeof value === 'string') {
    return writeString(buffer, offset, value);
  }
  if (typeof value === 'object') {
    if (Array.isArray(value)) {
      return writeEcmaArray(buffer, offset, value);
    }
    if (value instanceof Date) {
      return writeDate(buffer, offset, value);
    }
    return writeObject(buffer, offset, value);
  }
  return offset;
}

function writeNumber(buffer, offset, value) {
  // console.log(`writeNumber(buffer.length=${buffer ? buffer.length : 0}, offset=${offset}, value=${value})`);
  offset = writer.writeNumber(0x00, buffer, offset, 1); // number-marker
  if (buffer) {
    buffer.writeDoubleBE(value, offset);
  }
  return offset + 8;
}

function writeBoolean(buffer, offset, value) {
  // console.log(`writeBoolean(buffer.length=${buffer ? buffer.length : 0}, offset=${offset}, value=${value})`);
  offset = writer.writeNumber(0x01, buffer, offset, 1); // boolean-marker
  offset = writer.writeNumber(value ? 1 : 0, buffer, offset, 1);
  return offset;
}

function writeString(buffer, offset, str) {
  // console.log(`writeString(buffer.length=${buffer ? buffer.length : 0}, offset=${offset}, value="${str}")`);
  offset = writer.writeNumber(0x02, buffer, offset, 1); // string-marker
  const byteLength = writer.writeString(str, null, 0);
  offset = writer.writeNumber(byteLength, buffer, offset, 2);
  offset = writer.writeString(str, buffer, offset, byteLength);
  return offset;
}

function writeObject(buffer, offset, obj) {
  // console.log(`writeObject(buffer.length=${buffer ? buffer.length : 0}, offset=${offset})`);
  offset = writer.writeNumber(0x03, buffer, offset, 1); // object-marker
  for (const [key, value] of Object.entries(obj)) {
    offset = writer.writeNumber(key.length, buffer, offset, 2);
    offset = writer.writeString(key, buffer, offset);
    offset = writeValue(buffer, offset, value);
  }
  offset = writer.writeNumber(0, buffer, offset, 2);
  offset = writer.writeNumber(0x09, buffer, offset, 1); // object-end-marker
  return offset;
}

function writeNull(buffer, offset) {
  // console.log(`writeNull(buffer.length=${buffer ? buffer.length : 0}, offset=${offset})`);
  offset = writer.writeNumber(0x05, buffer, offset, 1); // null-marker
  return offset;
}

function writeUndefined(buffer, offset) {
  // console.log(`writeUndefined(buffer.length=${buffer ? buffer.length : 0}, offset=${offset})`);
  offset = writer.writeNumber(0x06, buffer, offset, 1); // undefined-marker
  return offset;
}

function writeEcmaArray(buffer, offset, arr) {
  // console.log(`writeEcmaArray(buffer.length=${buffer ? buffer.length : 0}, offset=${offset})`);
  offset = writer.writeNumber(0x08, buffer, offset, 1); // ecma-array-marker
  offset = writer.writeNumber(arr.length, buffer, offset, 4); // associative-count
  for (const value of arr) {
    offset = writer.writeNumber(0, buffer, offset, 2);
    offset = writeValue(buffer, offset, value);
  }
  offset = writer.writeNumber(0, buffer, offset, 2);
  offset = writer.writeNumber(0x09, buffer, offset, 1); // object-end-marker
  return offset;
}

function writeDate(buffer, offset, date) {
  // console.log(`writeDate(buffer.length=${buffer ? buffer.length : 0}, offset=${offset})`);
  offset = writer.writeNumber(0x0B, buffer, offset, 1); // date-marker
  if (buffer) {
    buffer.writeDoubleBE(date.getTime(), offset);
  }
  offset += 8;
  offset = writer.writeNumber(0, buffer, offset, 2); // Unused timezone
  return offset;
}

export {
  readValue,
  readAllValues,
  writeValue,
};
