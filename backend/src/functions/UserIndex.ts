import * as crypto from 'crypto';
import helpers from '../helpers';
import async from '../asyncpromise';
import User from '../models/User';
import { ifUserIndexDocument, ifUserDocument, UserIndexCreateFields, UserIndexCfOut } from '../interfaces';
import UserIndex from '../models/UserIndex';

export default {
    get: (token: string) => new Promise((resolve, reject) => {
        UserIndex.exists({
            token: token
        }).then((exists: boolean) => {
            if (exists) resolve();
            reject('No user exists with this token');
        });
    }),
    createIndex: (info: UserIndexCreateFields) => new Promise((resolve, reject) => {
        UserIndex.create(helpers.rmUndef({
            token: crypto.randomBytes(16).toString("hex"),
            isCritical: info.ic,
            email: info.email,
            userID: info._id || undefined
        }))
            .then((doc: ifUserIndexDocument) => helpers.sendMail(info.prefix, doc.token, info.email))
            .then(resolve)
            .catch(reject);
    }),
    confirm: (token: string) => new Promise((resolve, reject) => {
        UserIndex.findOne({
            token: token
        }).then((index: ifUserIndexDocument | null) => async.parallel({
            findUser: (callback: (err: Error | null, res: ifUserDocument | null) => void) => {
                User.findOne({
                    _id: index.userID
                })
                    .then((usr: ifUserDocument | null) => callback(null, usr))
                    .catch(err => callback(err, null));
            },
            delIndex: (callback: (err: Error | null, res: ifUserIndexDocument | null) => void) => {
                index.deleteOne()
                    .then((out: ifUserIndexDocument | null) => callback(null, out))
                    .catch(err => callback(err, null));
            }
        })).then((user: UserIndexCfOut) => {
            if (user.delIndex.isCritical) {
                user.findUser.updateOne({
                    $set: {
                        isVerified: true
                    }
                }).then(() => resolve());
            } else {
                resolve(user.findUser);
            }
        })
            .catch(reject);
    })
};