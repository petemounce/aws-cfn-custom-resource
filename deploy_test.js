'use strict';

var _ = require('lodash');
var proxyquire = require('proxyquire');

var resourceStubs = {};
var deploy = proxyquire('./deploy', resourceStubs);

exports.setUp = function (cb) {
  _.each(resourceStubs, function (v, k) {
    delete resourceStubs[k];
  });

  cb();
};

exports.testGeneratePolicies_empty_resources = function (test) {
  test.equal(deploy.generatePolicies({}).length, 0);
  test.done();
};

exports.testGeneratePolicies_empty_statements = function (test) {
  _.assign(resourceStubs, {
    test1: { '@noCallThru': true  }
  });

  test.equal(deploy.generatePolicies({
    'Custom::Test1': 'test1'
  }).length, 0);
  test.done();
};

exports.testGeneratePolicies = function (test) {
  _.assign(resourceStubs, {
    test1: {
      IAM_POLICY: {
        Version: '2012-10-17',
        Statement: [
          {
            Effect: 'Allow',
            Action: 's3:ListBucket',
            Resource: 'arn:aws:s3:::example_bucket'
          }
        ]
      },
      '@noCallThru': true
    },
    test2: {
      IAM_POLICY: {
        Version: '2012-10-17',
        Statement: [
          {
            Sid: '1',
            Effect: 'Allow',
            Principal: { AWS: ['arn:aws:iam::ACCOUNT-ID-WITHOUT-HYPHENS:root'] },
            Action: 's3:*',
            Resource: [
              'arn:aws:s3:::mybucket',
              'arn:aws:s3:::mybucket/*'
            ]
          }
        ]
      },
      '@noCallThru': true
    },
    test3: {
      // no policy
      '@noCallThru': true
    }
  });

  var policies = deploy.generatePolicies({
    'Custom::Test1': 'test1',
    'Custom::Test2': 'test2',
    'Custom::AAA': { module: 'test2' },
    'Custom::Test3': 'test3'
  });

  test.equal(policies.length, 3);
  test.ok(_.isEqual({ PolicyName: 'AAA', PolicyDocument: resourceStubs.test2.IAM_POLICY }, policies[0]));
  test.ok(_.isEqual({ PolicyName: 'Test1', PolicyDocument: resourceStubs.test1.IAM_POLICY }, policies[1]));
  test.ok(_.isEqual({ PolicyName: 'Test2', PolicyDocument: resourceStubs.test2.IAM_POLICY }, policies[2]));
  test.done();
};
