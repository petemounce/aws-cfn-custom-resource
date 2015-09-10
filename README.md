# CloudFormation Custom Resource

A node.js library to help write CloudFormation custom resources.

# Usage

## Handler

Create a module for the main custom resource handler. This handler maps custom
resource type names to modules that process the events for that resource. This
is the handler that is provided to the lambda function that executes the custom
resource.

### Example

`resource.js`

```javascript
var resource = require('aws-cfn-custom-resource');

exports.handler = resource.handler({
    'Custom::MyCustomResource': './lib/my-custom-resource'
});
```

## Resource Module

Implement request handlers for a custom resource type.

The resource module must export three functions:

* handleDelete
* handleCreate
* handleUpdate

### Input

The single parameter to a handler is a `CloudFormationEvent`.

The event includes all the properties from a [custom resource request](http://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/crpg-ref-requests.html),
plus some additional information detailed below.

<dl>
    <dt>stack.region</dt>
    <dd>
    <p>AWS region the stack that created the resource is located in.</p>
    </dd>

    <dt>stack.accountId</dt>
    <dd>
    <p>ID of the AWS account the stack that created the resource is located in.</p>
    </dd>

    <dt>stack.name</dt>
    <dd>
    <p>Name of the CloudFormation stack that the resource is a part of.</p>
    </dd>

    <dt>stack.arn</dt>
    <dd>
    <p>Full ARN of the CloudFormation stack that the resource is a part of. Alias for <em>StackId</em>.</p>
    </dd>
</dl>

### Output

A handler should return one of the following:

* undefined/null to indicate success
* an object with keys:
  * `physicalResourceId` - _optional_ - Identifier unique to the custom resource
    vendor. If not provided, a resource id is generated.
  * `data` - _optional_ - Custom resource provider-defined name-value pairs to send
    with the response. The values provided here can be accessed by name in
    the template with <a href="http://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/intrinsic-function-reference-getatt.html">Fn::GetAtt</a>.
* a promise that results in one of the above values

A handler may also throw an error to indicate failure.

### AWS API

If the resource interacts with AWS APIs, it should also export a list of IAM
policy statements that define the required permissions as `IAM_POLICY`.

This library provides a helper for the AWS JavaScript SDK that converts SDK
functions from callback to promises. It also logs all requests and responses.
The helper can also make it easier to stub/mock AWS APIs in unit tests.

```javascript
var resource = require('aws-cfn-custom-resource');

exports.IAM_POLICY = [
    {
        Effect: "Allow",
        Action: ["ec2:Describe*"],
        Resource: "*"
    }
];

exports.handleCreate = function (event) {
    var session = new resource.aws.Session();
    var ec2 = session.client('EC2');

    return ec2.describeInstances({InstanceIds: ['i-234232']})
    .then(function (result) {
        // do something magical
    });
};
```

### Example

`lib/my-custom-resource.js`

```javascript
exports.handleDelete = function (event) {
    // Return nothing and the custom resource responds with success.
    // Can also:
    //   throw new Error("some message");
    //   -- or
    //   var resource = require('aws-cfn-custom-resource');
    //   throw resource.newError("MyException", "some message");
    //   -- or
    //   return {physicalResourceId: "myResource"};

    // You can also do the following:
    //   throw "some message";
    // However, you will not get a stack trace in this case. It is recommended
    // to throw Error instead.
};

exports.handleUpdate = function (event) {
    // Async handlers should respond with a promise.
    var Q = require('q');
    var deferred = Q.defer();

    doSomethingAsync(function (err, result) {
        if (err) {
            deferred.reject(err);
        } else {
            deferred.resolve({
                physicalResourceId: 'SomeResourceId',
                data: {
                    key1: "Value",
                    key2: "Value2"
                }
            });
        }
    });

    return deferred.promise();
};

// Sometimes it makes sense to use the same implementation for create & update.
exports.handleCreate = exports.handleUpdate;
```
