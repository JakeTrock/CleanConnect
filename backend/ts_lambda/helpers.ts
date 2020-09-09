import jwt from 'jwt-then';
import { JWTuser, exterr } from './interfaces';
import conf from './config/keys';
import { inspect } from 'util';
// import * as crypto from 'crypto';
import User from './models/User';
import { APIGatewayEvent } from 'aws-lambda';
import * as AWS from 'aws-sdk';

AWS.config.update({
    accessKeyId: conf.akid,
    secretAccessKey: conf.ask,
    region: 'us-east'
});
const s3 = new AWS.S3();
const ses = new AWS.SES({ apiVersion: '2010-12-01' });
const codecs: Array<string> = [
    "video/mp4",
    "video/webm",
    "image/webp",
    "image/gif",
    "image/jpeg",
    "image/png",
    "image/jpg",
    "image/tiff"
];
const mailbod = [`<img src="data:image/png;base64,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"/>
            <p style="font-size:25px">
                <br /> "To `, ` your account, please click the link below. Thank you for your patience!"
                <br />
            </p>
            <a href="`, `/user/`, `/`, `" style="font-size:25px">
                `, ` account
            </a>
            <style>
            a {
                background-color: #4caf50;
                border: none;
                color: white;
                padding: 15px 32px;
                text-align: center;
                text-decoration: none;
                display: inline-block;
                font-size: 16px;
                margin: 4px 2px;
                cursor: pointer;
            }
            .button2 {
                background-color: #008cba;
            }
            </style>`];

export default {
    rmUndef: (obj: any) => {
        Object.keys(obj)
            .forEach(key => {
                if (obj[key] == undefined || obj[key] == null) {
                    delete obj[key]
                }
            });
        return obj;
    },
    uploadImage: (event: APIGatewayEvent) => {
        return new Promise((resolve, reject) => {
            const body = JSON.parse(event.body || '');
            if (body || (typeof body.filename === 'string')) {
                const filename = body.filename;
                const tags = body.tags;
                const fex = filename.split('.')[filename.split('.').length];
                if (codecs.indexOf(fex.mimetype) >= 0) {
                    // const fname = crypto.randomBytes(16).toString("hex").substring(8) + fex;
                    // missing proper error handling
                    const postObj = s3.createPresignedPost({
                        Bucket: conf.bname,
                        Expires: 90, // expiration in seconds
                        // matches any value for tagging
                        Conditions: tags && [['starts-with', '$tagging', '']],
                        Fields: {
                            key: filename,//TODO:change to fname later
                        },
                    });

                    resolve({
                        url: postObj.url,
                        fields: {
                            ...postObj.fields,
                            // augment post object with the tagging values
                            tagging: tags ? (tagset: Record<string, string>): string => {
                                const tags = Object.entries(tagset).reduce(
                                    (acc, [key, value]) => `${acc}<Tag><Key>${key}</Key><Value>${value}</Value></Tag>`,
                                    '',
                                );

                                return `<Tagging><TagSet>${tags}</TagSet></Tagging>`;
                            } : undefined,
                        },
                    });

                } else reject({ message: "Invalid filetype(we allow png, jpg, jpeg, webp, gif, tiff, mp4 and webm uploads up to 5.1 MB)" });
            } else resolve();
        });
    },
    deleteImage: (imageName: string) => {
        return new Promise((resolve, reject) => {
            s3.deleteObject({
                Bucket: conf.bname,
                Key: imageName
            }, function (err, data) {
                if (err) reject(err);
                else resolve();
            })
        });
    },
    sendMail: (pf: string, token: string, to: string) => {
        return new Promise((resolve, reject) => {
            const pfb = (pf == "resetPass") ? "reset password of" : pf;
            const params = {
                Destination: {
                    ToAddresses: [to]
                },
                Message: {
                    Body: {
                        Html: {
                            Charset: 'UTF-8',
                            Data: mailbod[0] + pfb + mailbod[1] + conf.domain + mailbod[2] + pf + mailbod[3] + token + mailbod[4] + pfb + mailbod[5]
                        }
                    },
                    Subject: {
                        Charset: 'UTF-8',
                        Data: `CleanConnect: ${pfb} Account`
                    }
                },
                ReturnPath: conf.email,
                Source: conf.email,
            };

            ses.sendEmail(params, (err, data) => {
                if (err) {
                    reject({ message: err });
                } else {
                    resolve({
                        success: true,
                        status: `An email to ${pf} has been sent to ${to}`
                    });
                }
            });
        });
    },
    scadd: (dat: any) => {
        dat["success"] = true;
        return {
            statusCode: 200,
            headers: {
                'Access-Control-Allow-Origin': '*'
            },
            body: JSON.stringify(dat),
        };
    },
    blankres: {
        statusCode: 200,
        headers: {
            'Access-Control-Allow-Origin': '*'
        },
        body: "{success:true}"
    },
    erep: (err: Error | exterr | any) => {
        const ptx: string = inspect(err);
        return {
            statusCode: 400,
            headers: {
                'Access-Control-Allow-Origin': '*'
            },
            body: (err.message) ? err.message : ptx
        };
    },
    passport: (event: APIGatewayEvent): Promise<JWTuser> => {
        return new Promise((resolve, reject) => {
            var authHeader;
            if (typeof event.headers === "string") authHeader = JSON.parse(event.headers).authorization;
            else authHeader = event.headers.authorization;//TODO:https://kennbrodhagen.net/2015/12/02/how-to-access-http-headers-using-aws-api-gateway-and-lambda/
            if (authHeader) {
                jwt.verify(authHeader.split(' ')[1], conf.secretOrKey)
                    .then((out: string | object): Promise<JWTuser> => new Promise((resolve, reject) => {
                        if (typeof out == "string") reject(out);
                        else resolve(out as JWTuser);
                    })).then((out: JWTuser) =>
                        User.findOne({
                            where: { id: out.id }
                        }).then((ex: User) => {
                            if (ex) {
                                resolve(out);
                            } else reject(403);
                        }))
                    .catch(err => reject(err));
            } else {
                reject(401);
            }
        });
    }
}