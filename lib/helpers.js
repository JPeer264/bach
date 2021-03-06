'use strict';

var assert = require('assert');

var filter = require('lodash.filter');
var map = require('lodash.map');
var flatten = require('lodash.flatten');
var forEach = require('lodash.foreach');

function noop() {}

function getExtensions(lastArg) {
  if (typeof lastArg !== 'function') {
    return lastArg;
  }
}

function buildOnSettled(done) {
  if (typeof done !== 'function') {
    done = noop;
  }

  function onSettled(error, result) {
    if (error) {
      return done(error, null);
    }

    var settledErrors = filter(result, { state: 'error' });
    var settledResults = filter(result, { state: 'success' });

    var errors = null;
    if (settledErrors.length) {
      errors = map(settledErrors, 'value');
    }

    var results = null;
    if (settledResults.length) {
      results = map(settledResults, 'value');
    }

    done(errors, results);
  }

  return onSettled;
}

function verifyArguments(args) {
  args = flatten(args);
  var lastIdx = args.length - 1;

  assert.ok(args.length, 'A set of functions to combine is required');

  forEach(args, function(arg, argIdx) {
    var isFunction = typeof arg === 'function';
    if (isFunction) {
      return;
    }

    if (argIdx === lastIdx) {
      // Last arg can be an object of extension points
      return;
    }

    var msg = 'Only functions can be combined, got ' + typeof arg +
      ' for argument ' + argIdx;
    assert.ok(isFunction, msg);
  });

  return args;
}

module.exports = {
  getExtensions: getExtensions,
  onSettled: buildOnSettled,
  verifyArguments: verifyArguments,
};
