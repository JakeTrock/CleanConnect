import {
    Serverless
} from 'serverless/aws';
const serverlessConfiguration: Serverless = {
    service: {
        name: 'cleanconnect'
    },
    plugins: ["serverless-offline"],
    frameworkVersion: '>=1.72.0',
    provider: {
        name: 'aws',
        runtime: 'nodejs12.x',
        apiGateway: {
            minimumCompressionSize: 1024,
        },
        environment: {
            testing: true,
            mid: "braintree",
            pbk: "braintree",
            prk: "braintree",
            secretOrKey: "78:5f:4d:4e:a8:6a",
            akid: "",
            ask: "",
            bname: "BUCKETNAME",
            domain: "https://cleanconnect.us",
            email: "'cleanconnect.us' <noreply@cleanconnect.us>",
            dbName: "ccdev",
            dbUser: "postgres",
            dbPass: "",
            dbHost: ""
        },
        iamRoleStatements: [
            {
                Effect: "Allow",
                Action: [
                    "s3:ListBucket"
                ],
                Resource: "arn:aws:s3:::BNAME"
            },
            {
                Effect: "Allow",
                Action: [
                    "s3:PutObject"
                ],
                Resource: "arn:aws:s3:::BUCKETNAME/*"
            }
        ]
    },
    functions: {
        endpoint: {
            handler: 'handler.endpt',
            name: 'endpt',
            events: [{
                http: {
                    path: '/backend',
                    method: 'post',
                    cors: true
                }
            }]
        }
    }
};
module.exports = serverlessConfiguration;
