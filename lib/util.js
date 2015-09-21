'use strict';

exports.newError = function (name, message, context) {
  var _ = require('lodash');

  var err = new Error(message);
  err.name = name;

  if (context && !_.isEmpty(context)) {
    err.context = context;
  }

  return err;
};

exports.generateResourceId = function (stackName, logicalResourceId) {
  var _ = require('lodash');
  var randomstring = require('randomstring');
  var util = require('util');

  return util.format('%s-%s-%s',
      _.trunc(stackName, { omission: '', length: 39 }),
      _.trunc(logicalResourceId, { omission: '', length: 39 }),
      randomstring.generate(13).toUpperCase());
};
