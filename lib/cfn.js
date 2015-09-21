'use strict';

var _ = require('lodash');
var q = require('q');
var cfnUtil = require('./util');
var util = require('util');

function CloudFormationEvent (event, context) {
  _.assign(this, event);
  this.context = context;

  // arn:aws:cloudformation:us-east-1:123456789012:stack/mystack-mynestedstack-sggfrhxhum7w/f449b250-b969-11e0-a185-5081d0136786
  var stackId = this.StackId.split(':');
  var stackName = stackId[5].split('/');

  this.stack = {
    arn: this.StackId,
    region: stackId[3],
    accountId: stackId[4],
    name: stackName[1]
  };
}

CloudFormationEvent.prototype.send = function (body) {
  var responseBody = JSON.stringify(body);

  var https = require('https');
  var url = require('url');

  var parsedUrl = url.parse(this.ResponseURL);
  var options = {
    hostname: parsedUrl.hostname,
    port: parsedUrl.port || 443,
    path: parsedUrl.path,
    method: 'PUT',
    headers: {
      'content-type': '',
      'content-length': responseBody.length
    }
  };
  var context = this.context;
  var attemptCount = 0;

  (function sendRequest () {
    attemptCount += 1;

    var request = https.request(options, function (response) {
      console.log('RESPONSE SENT:\n', responseBody);
      console.log('Status code:', response.statusCode);
      console.log('Status message:', response.statusMessage);
      context.done();
    });

    request.on('error', function (error) {
      if (attemptCount >= 4) {
        console.error('Send CFN result failed (giving up):', error);
        context.done();
      } else {
        console.log('Send CFN result failed (will retry):', error);
        q.delay(250).then(sendRequest);
      }
    });

    request.write(responseBody);
    request.end();
  })();
};

CloudFormationEvent.prototype.failed = function (reason) {
  this.send({
    Status: 'FAILED',
    Reason: util.format('%s (%s)', reason, this.context.logStreamName),
    StackId: this.StackId,
    RequestId: this.RequestId,
    LogicalResourceId: this.LogicalResourceId,
    PhysicalResourceId: this.getPhysicalResourceId()
  });
};

CloudFormationEvent.prototype.success = function (physicalResourceId, data) {
  this.send({
    Status: 'SUCCESS',
    StackId: this.StackId,
    RequestId: this.RequestId,
    LogicalResourceId: this.LogicalResourceId,
    PhysicalResourceId: physicalResourceId || this.getPhysicalResourceId(),
    Data: data || undefined
  });
};

CloudFormationEvent.prototype.getPhysicalResourceId = function () {
  if (!this.PhysicalResourceId) {
    this.PhysicalResourceId = cfnUtil.generateResourceId(this.stack.name, this.LogicalResourceId);
  }

  return this.PhysicalResourceId;
};

exports.CloudFormationEvent = CloudFormationEvent;
