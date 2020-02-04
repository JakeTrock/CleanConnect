const aws = require('aws-sdk');

aws.config.update({
    accessKeyId: "AKIAXHXVGIFH2YHQW45X",
    secretAccessKey: "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",
    region: "us-east-1",
});
const ses = new aws.SES();


function sendMail(body, sub, to, cb) {
    ses.sendEmail({
        Destination: {
            ToAddresses: [to]
        },
        Message: {
            Body: {
                Html: {
                    Charset: 'UTF-8',
                    Data: body
                }
            },
            Subject: {
                Charset: 'UTF-8',
                Data: sub
            }
        },
        ReturnPath: 'info@cleanconnect.jakesandbox.com',
        Source: 'info@cleanconnect.jakesandbox.com'
    }, (err, data) => {
        if (err) cb(err)
        else console.log(data)
    })
}
sendMail("test body","test subject","jtbosshku@gmail.com",function(err){
console.log(err);
});
