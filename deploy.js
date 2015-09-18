'use strict';

var _ = require('lodash');

exports.generatePolicies = function (resources) {
  return _(resources)
  .map(function (config, resourceType) {
    var resourceName = resourceType.split('::', 2)[1]; // Remove the 'Custom::' prefix
    var moduleName = _.isString(config) ? config : config.module;
    var module = require(moduleName);

    if (!module.IAM_POLICY) {
      return null;
    }

    return {
      PolicyName: resourceName,
      PolicyDocument: _.cloneDeep(module.IAM_POLICY)
    };
  })
  .filter(function (policy) {
    return policy !== null;
  })
  .sortBy('PolicyName')
  .value();
};
