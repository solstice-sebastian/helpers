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
  isEqualPrice,
} = require('../dist/index.js');

test(`modByPercent`, (t) => {
  t.equal(modByPercent(42, 0.02, 2), 42.84, 'should increase by percent');
  t.equal(modByPercent(42, -0.02, 2), 41.16, 'should descrease by percent');
  const posFloat = 42.123432;
  t.equal(modByPercent(posFloat, 0.02, 2), 42.97, 'should increase by percent');
  t.equal(modByPercent(posFloat, -0.02, 2), 41.28, 'should descrease by percent');
  t.end();
});

test(`getPercentDiff`, (t) => {
  t.equal(getPercentDiff(42, 42.84, 2), 0.02, 'should return percent increase as float');
  t.equal(getPercentDiff(42, 41.28, 2), -0.02, 'should return percent descrease as float');
  t.equal(getPercentDiff(0.00083, 0.00099, 2), 0.19, 'should work on fractions: increase');
  t.equal(getPercentDiff(0.00099, 0.00083, 2), -0.16, 'should work on fractions: decrease');
  t.end();
});

test(`nicePercent`, (t) => {
  const p = 0.12345678;
  t.equal(nicePercent(p), '12.35%', 'should default to 2 places and round');
  t.equal(nicePercent(p, 0), '12%', 'should take places param');
  t.equal(nicePercent(p, 3), '12.346%', 'should take places param');
  t.end();
});

test(`toQueryString`, (t) => {
  const input = {
    key1: 'val1',
    key2: 'val2',
  };
  const expected = 'key1=val1&key2=val2';
  t.equal(toQueryString(input), expected);
  t.equal(
    toQueryString(Object.assign({}, input, { bogus: undefined })),
    expected,
    'should not add empty vals'
  );
  t.end();
});

test(`validateRequired`, (t) => {
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
  t.equal(validateRequired(required, params).length, 3, 'should return 3 errors');
  t.equal(
    validateRequired(required, params).every((error) => error.constructor === Error),
    true,
    'should return Errors'
  );
  t.equal(
    validateRequired(required, validParams).length,
    0,
    'should return empty array when valid'
  );
  t.throws(() => validateRequired(required, params, true), 'should throw when flag set');
  t.end();
});

test(`toSatoshi`, (t) => {
  t.equal(toSatoshi(391), 0.00000391);
  t.equal(toSatoshi(100), Constants.ONE_HUNDRED_SHATOSHIS);
  t.equal(toSatoshi(1), Constants.ONE_SHATOSI);
  t.end();
});

test(`msToDatetime`, (t) => {
  t.true(msToDatetime(Date.now()), 'can format for timezone');
  t.end();
});

test.only(`isEqualPrice`, (t) => {
  t.true(isEqualPrice(4, 4));
  t.true(isEqualPrice('4', '4'));
  t.true(isEqualPrice(4, '4'));
  t.true(isEqualPrice(4.0492, 4.0492));
  t.true(isEqualPrice(4.123456782, 4.123456783));
  t.true(isEqualPrice('4.123456782', '4.123456783'));

  t.false(isEqualPrice(3, 4));
  t.false(isEqualPrice('4', 2));
  t.false(isEqualPrice(NaN, NaN));
  t.throws(() => {
    isEqualPrice(true, true);
  });
  t.throws(() => {
    isEqualPrice(false, false);
  });
  t.false(isEqualPrice(4.123456782, 4.123456789));
  t.false(isEqualPrice('4.123456782', '4.123456789'));
  t.end();
});
