"use strict";

var aws = require('aws-sdk');
var q = require('q');
var _ = require('lodash');

var nextCallNumber = 1;

function AwsSession(config) {
    this.config = config;
    this.clients = {};
}

AwsSession.prototype.client = function (clientName) {
    var client = this.clients[clientName];

    if (!client) {
        client = new aws[clientName](this.config);

        _.functions(client).forEach(function (funcName) {
            var realFunction = client[funcName];

            client[funcName] = function (params) {
                var deferred = q.defer();
                var callNumber = nextCallNumber++;

                console.log("REQUEST " + clientName + "." + funcName + "[" + callNumber + "]:\n" + JSON.stringify(params));
                realFunction.apply(client, params, function (err, data) {
                    if (err) {
                        console.log("ERROR " + clientName + "." + funcName + "[" + callNumber + "]:\n" + JSON.stringify(err));
                        var ex = new Error(err.message);
                        ex.name = err.code;

                        var context = _.omit(ex, ["message", "code"]);
                        if (!_.isEmpty(context)) {
                            ex.context = context;
                        }

                        deferred.reject(ex);
                    } else {
                        console.log("RESPONSE " + clientName + "." + funcName + "[" + callNumber + "]:\n" + JSON.stringify(data));
                        deferred.resolve(data);
                    }
                });

                return deferred.promise;
            };
        });

        this.clients[clientName] = client;
    }

    return client;
};

exports.Session = AwsSession;
