'use strict';

var cfn = require('./cfn');
var _ = require('lodash');

exports.testParseStackId = function (test) {
  var event = new cfn.CloudFormationEvent(
    {
      StackId: 'arn:aws:cloudformation:us-east-1:123456789012:stack/mystack-mynestedstack-sggfrhxhum7w/f449b250-b969-11e0-a185-5081d0136786'
    }, {
      Context: true
    }
  );

  test.ok(_.isEqual(event.stack, {
    region: 'us-east-1',
    accountId: '123456789012',
    name: 'mystack-mynestedstack-sggfrhxhum7w',
    arn: 'arn:aws:cloudformation:us-east-1:123456789012:stack/mystack-mynestedstack-sggfrhxhum7w/f449b250-b969-11e0-a185-5081d0136786'
  }), JSON.stringify(event.stack));
  test.equal(event.StackId, 'arn:aws:cloudformation:us-east-1:123456789012:stack/mystack-mynestedstack-sggfrhxhum7w/f449b250-b969-11e0-a185-5081d0136786');
  test.ok(event.context.Context);
  test.done();
};
