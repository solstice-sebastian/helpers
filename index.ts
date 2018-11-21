import moment from 'moment-timezone';
import glob from 'glob';
import fs from 'fs';
import { DATETIME, DATETIME_FILENAME } from '@solstice.sebastian/constants';

/**
 * @param price {Number}
 * @param mod {Number} percentage in float form i.e. 2% => 0.02 || -2% => -0.02
 */
const modByPercent = (price: number, mod: number, digits: number = 10): number => +(price * (1 + mod)).toFixed(digits);

const rand = (min: number, max: number): number => Math.random() * (max - min) + min;

/**
 * @param start {Number}
 * @param end {Number}
 * @return float representation of a percent i.e. 2% => 0.02 || -2% => -0.02
 */
const getPercentDiff = (start: number, end: number, digits = 10): number => {
  const _start = +start;
  const _end = +end;

  let diff;
  if (_end < _start) {
    diff = (_start - _end) / _start * -1;
  } else {
    diff = (_end - _start) / _start;
  }
  return +diff.toFixed(digits);
};

const nicePercent = (percent: number, digits: number = 2): string => `${(percent * 100).toFixed(digits)}%`;

const globDelete = (globStr: string): Promise<any> =>
  new Promise((res, rej) => {
    glob(globStr, (err, files) => {
      if (err) {
        rej(err);
      } else {
        files.forEach(fs.unlinkSync);
        res();
      }
    });
  });

const noop = (args?: any): any => {};

const datetimeForFilename = (): string => moment().format(DATETIME_FILENAME);
const datetime = (): string => moment().format(DATETIME);
const msToDatetime = (ms: number): string => moment(ms).tz('America/Los_Angeles').format(DATETIME);

const toQueryString = (obj: any): string => {
  let str = '';
  Object.keys(obj).forEach((key) => {
    if (obj[key] !== undefined) {
      str = `${str}&${key}=${obj[key]}`;
    }
  });
  return str.replace(/&$/, '').replace(/^&/, '');
};

const validateRequired = (required: any, params: any, shouldThrow = false): Error[] => {
  const requiredKeys = Object.keys(required);
  const errors: string[] = [];

  Object.keys(required).forEach((key: string) => {
    const value = params[key];
    const requiredItem = required[key];

    if (requiredKeys.includes(key) === true) {
      if (value === undefined) {
        // is required but undefined
        errors.push(`Missing param '${key}'`);
      } else if (
        typeof requiredItem.validator === 'function' &&
        requiredItem.validator(value) === false
      ) {
        errors.push(`Failed validator function for param '${key}'`);
      } else if (requiredItem.type !== undefined && typeof value !== requiredItem.type) {
        // is required but wrong type
        errors.push(`Incorrect type for param '${key}'. Received '${typeof value}'`);
      }
    }
  });

  if (errors.length > 0 && shouldThrow === true) {
    throw new Error(errors.join('\n'));
  } else {
    return errors.map((msg) => new Error(msg));
  }
};

const safeJson = (response: any): any => {
  if (response.status === 200) {
    return response.json();
  }
  console.log(`response.status:`, response.status);
  console.log(`response.statusText:`, response.statusText);
  return response;
};

const castSatoshi = (number: number): number => +number.toFixed(8);

const toSatoshi = (number: number): number => +(+number * 0.00000001).toFixed(8);

const getDecimalPlaces = (num: number): number => {
  const parts = num.toString().split('.');
  if (parts.length > 1) {
    const afterDecimal = parts[1];
    const indexOfOne = afterDecimal.indexOf('1') + 1;
    return indexOfOne;
  }
  return 0; // whole number
}

const isEqualPrice = (a: number | string, b: number | string): boolean => {
  if (Number.isNaN(+a) || Number.isNaN(+b)) {
    console.log(`isEqualPrice received NaN`);
    return false;
  }

  if (typeof a !== 'number' && typeof a !== 'string') {
    throw Error(`isEqualPrice expected number|string but received ${typeof a}`);
  }

  if (typeof b !== 'number' && typeof b !== 'string') {
    throw Error(`isEqualPrice expected number|string but received ${typeof b}`);
  }

  return parseFloat(`${a}`).toFixed(8) === parseFloat(`${b}`).toFixed(8);
};

export {
  modByPercent,
  getPercentDiff,
  noop,
  datetime,
  datetimeForFilename,
  globDelete,
  msToDatetime,
  nicePercent,
  toQueryString,
  validateRequired,
  castSatoshi,
  toSatoshi,
  safeJson,
  rand,
  getDecimalPlaces,
  isEqualPrice
};