var _ = require('lodash');

exports.cfn = require('./cfn');
exports.aws = require('./aws');

_.assign(exports, require('./util'));

exports.handler = function (resources) {
    var Q = require('q');

    return function (event, context) {
        console.log('REQUEST RECEIVED:\n', JSON.stringify({Event: event, Context: context}));
        var cfnEvent = new exports.cfn.CloudFormationEvent(event, context);

        var failed = function (err) {
            var reason = err;

            if (err instanceof Error) {
                if (err.context) {
                    console.error(JSON.stringify(err.context), "\n", err.stack);
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
            var resourceModuleName = resources[cfnEvent.ResourceType];

            if (!resourceModuleName) {
                cfnEvent.failed("Unknown or invalid resource type: " + cfnEvent.ResourceType);
                return;
            }

            var resourceModule = require(resourceModuleName);
            var handlerFuncName = 'handle' + cfnEvent.RequestType;
            var handlerFunc = resourceModule[handlerFuncName];

            if (!handlerFunc) {
                cfnEvent.failed("Missing resource handler: module=" + resourceModuleName + "; function=" + handlerFuncName);
                return;
            }

            Q(handlerFunc(cfnEvent))
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
