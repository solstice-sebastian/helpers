const Constants = require('@solstice.sebastian/constants');
const test = require('tape');
const {
  modByPercent,
  nicePercent,
  getPercentDiff,
  toQueryString,
  validateRequired,
  msToDatetime,
  toSatoshi,
} = require('../dist/index.js');

test(`modByPercent`, (assert) => {
  assert.equal(modByPercent(42, 0.02, 2), 42.84, 'should increase by percent');
  assert.equal(modByPercent(42, -0.02, 2), 41.16, 'should descrease by percent');
  const posFloat = 42.123432;
  assert.equal(modByPercent(posFloat, 0.02, 2), 42.97, 'should increase by percent');
  assert.equal(modByPercent(posFloat, -0.02, 2), 41.28, 'should descrease by percent');
  assert.end();
});

test(`getPercentDiff`, (assert) => {
  assert.equal(getPercentDiff(42, 42.84, 2), 0.02, 'should return percent increase as float');
  assert.equal(getPercentDiff(42, 41.28, 2), -0.02, 'should return percent descrease as float');
  assert.equal(getPercentDiff(0.00083, 0.00099, 2), 0.19, 'should work on fractions: increase');
  assert.equal(getPercentDiff(0.00099, 0.00083, 2), -0.16, 'should work on fractions: decrease');
  assert.end();
});

test(`nicePercent`, (assert) => {
  const p = 0.12345678;
  assert.equal(nicePercent(p), '12.35%', 'should default to 2 places and round');
  assert.equal(nicePercent(p, 0), '12%', 'should take places param');
  assert.equal(nicePercent(p, 3), '12.346%', 'should take places param');
  assert.end();
});

test(`toQueryString`, (assert) => {
  const input = {
    key1: 'val1',
    key2: 'val2',
  };
  const expected = 'key1=val1&key2=val2';
  assert.equal(toQueryString(input), expected);
  assert.equal(
    toQueryString(Object.assign({}, input, { bogus: undefined })),
    expected,
    'should not add empty vals'
  );
  assert.end();
});

test(`validateRequired`, (assert) => {
  const required = {
    key1: {
      type: 'string',
    },
    key2: {},
    key3: {
      type: 'number',
      validator: (value) => value > 5,
    },
    key4: {},
  };

  const params = {
    key1: [], // wrong type
    key2: null, // valid
    key3: 2, // fails validator
    // key4 is missing
  };
  const validParams = {
    key1: 'val1',
    key2: null,
    key3: 6,
    key4: false,
  };
  assert.equal(validateRequired(required, params).length, 3, 'should return 3 errors');
  assert.equal(
    validateRequired(required, params).every((error) => error.constructor === Error),
    true,
    'should return Errors'
  );
  assert.equal(
    validateRequired(required, validParams).length,
    0,
    'should return empty array when valid'
  );
  assert.throws(() => validateRequired(required, params, true), 'should throw when flag set');
  assert.end();
});

test(`toSatoshi`, (assert) => {
  assert.equal(toSatoshi(391), 0.00000391);
  assert.equal(toSatoshi(100), Constants.ONE_HUNDRED_SHATOSHIS);
  assert.equal(toSatoshi(1), Constants.ONE_SHATOSI);
  assert.end();
});

test(`msToDatetime`, (assert) => {
  assert.true(msToDatetime(Date.now()), 'can format for timezone');
  assert.end();
});
