var cfn = require('./cfn');
var _ = require('lodash');

exports.testParseStackId = function (test) {
    var event = new cfn.CloudFormationEvent(
        {
            StackId: "arn:aws:cloudformation:eu-west-1:774013277495:stack/anon-sodexo-master-20150831T145652/83daad40-4ff0-11e5-897a-50fa18c86ab4"
        }, {
            Context: true
        }
    );

    test.ok(_.isEqual(event.stack, {
        region: "eu-west-1",
        accountId: "774013277495",
        name: "anon-sodexo-master-20150831T145652",
        arn: "arn:aws:cloudformation:eu-west-1:774013277495:stack/anon-sodexo-master-20150831T145652/83daad40-4ff0-11e5-897a-50fa18c86ab4"
    }), JSON.stringify(event.stack));
    test.equal(event.StackId, "arn:aws:cloudformation:eu-west-1:774013277495:stack/anon-sodexo-master-20150831T145652/83daad40-4ff0-11e5-897a-50fa18c86ab4");
    test.ok(event.context.Context);
    test.done();
};
