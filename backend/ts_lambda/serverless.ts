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
            mid: "m2jfqj6kzbv9fjn3",
            pbk: "vvn3gp9tctxntj3w",
            prk: "d97c664a90d9bacc02eeec7af7dd630b",
            secretOrKey: "78:5f:4d:4e:a8:6a",
            akid: "AKIAJI42CNK5UZNHHFNQ",
            ask: "dZ2wImeIcKINRjowW0NSRCLc+NoVyDBbDuIFES+v",
            bname: "cleanconnectimages",
            domain: "https://cleanconnect.us",
            email: "'cleanconnect.us' <noreply@cleanconnect.us>",
            dbName: "database-1",
            dbUser: "ccdef",
            dbPass: "Ly3v1372TJ4thXx0GSye",
            dbHost: "database-1.ccgwsnlzm4yj.us-east-1.rds.amazonaws.com"
        },
        iamRoleStatements: [
            {
                Effect: "Allow",
                Action: [
                    "s3:ListBucket"
                ],
                Resource: "arn:aws:s3:::cleanconnectimages"
            },
            {
                Effect: "Allow",
                Action: [
                    "s3:PutObject"
                ],
                Resource: "arn:aws:s3:::cleanconnectimages/*"
            }
        ]
    },
    functions: {
        //COMMENT
        cmt: {
            handler: 'handler.cmtRt',
            name: 'cmt',
            events: [{
                http: {
                    path: 'comment/{opname}/{id}/{comment_id}',
                    method: 'post',
                    cors: true
                }
            }]
        },
        //INVENTORY
        inv: {
            handler: 'handler.invRt',
            name: 'inv',
            events: [{
                http: {
                    path: 'inventory/{opname}/{id}',
                    method: 'post',
                    cors: true
                }
            }]
        },
        //ITEM
        itm: {
            handler: 'handler.itmRt',
            name: 'itm',
            events: [{
                http: {
                    path: 'item/{opname}/{id}/{item_id}',
                    method: 'post',
                    cors: true
                }
            }]
        },
        //TAG
        tag: {
            handler: 'handler.tagRt',
            name: 'tag',
            events: [{
                http: {
                    path: 'tag/{opname}/{id}',
                    method: 'post',
                    cors: true
                }
            }]
        },
        //USER
        usr: {
            handler: 'handler.usrRt',
            name: 'usr',
            events: [{
                http: {
                    path: 'usr/{opname}/{token}',
                    method: 'post',
                    cors: true
                }
            }]
        }
    }
};
module.exports = serverlessConfiguration;