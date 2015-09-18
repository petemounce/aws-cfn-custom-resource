'use strict';

var awsSdk = require('aws-sdk');
var q = require('q');
var _ = require('lodash');

function AwsSession (config) {
  this.config = config;
  this.clients = {};
}

AwsSession.prototype.client = function (clientName) {
  var client = this.clients[clientName];

  if (!client) {
    var realClient = new (_.get(awsSdk, clientName))(this.config);
    client = {};

    _.functions(realClient).forEach(function (funcName) {
      client[funcName] = q.nbind(realClient[funcName], realClient);
    });

    this.clients[clientName] = client;
  }

  return client;
};

exports.Session = AwsSession;
