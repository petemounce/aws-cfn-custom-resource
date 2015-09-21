'use strict';

var _ = require('lodash');

exports.cfn = require('./cfn');
exports.aws = require('./aws');

_.assign(exports, require('./util'));

exports.handler = function (resources) {
  var util = require('util');
  var Q = require('q');

  return function (event, context) {
    console.log('REQUEST RECEIVED:\n', JSON.stringify({ Event: event, Context: context }));
    var cfnEvent = new exports.cfn.CloudFormationEvent(event, context);

    var failed = function (err) {
      var reason = err;

      if (_.isError(err)) {
        if (err.context) {
          console.error(JSON.stringify(err.context), '\n', err.stack);
        } else {
          console.error(err.stack);
        }

        reason = err.toString();
      } else if (!_.isString(err)) {
        reason = JSON.stringify(err);
      }

      cfnEvent.failed(reason);
    };

    try {
      var resourceConfig = resources[cfnEvent.ResourceType];

      if (!resourceConfig) {
        cfnEvent.failed(util.format('Unknown or invalid resource type: %s', cfnEvent.ResourceType));
        return;
      }

      if (_.isString(resourceConfig)) {
        resourceConfig = { module: resourceConfig };
      }

      var resourceModule = require(resourceConfig.module);
      var handlerFuncName = util.format('handle%s', cfnEvent.RequestType);
      var handlerFunc = resourceModule[handlerFuncName];

      if (!handlerFunc) {
        cfnEvent.failed(util.format('Missing resource handler: module=%s; function=%s', resourceConfig.module, handlerFuncName));
        return;
      }

      Q(handlerFunc(cfnEvent, resourceConfig))
      .then(function (result) {
        if (_.isObject(result)) {
          cfnEvent.success(result.physicalResourceId, result.data);
        } else {
          cfnEvent.success();
        }
      })
      .catch(failed);
    } catch (e) {
      failed(e);
    }
  };
};
