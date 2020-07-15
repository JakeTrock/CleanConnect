import * as crypto from 'crypto';
import helpers from '../helpers';
import async from '../asyncpromise';
import User from '../models/User';
import { ifUserIndexDocument, ifUserDocument, UserIndexCreateFields, UserIndexCfOut } from '../interfaces';
import UserIndex from '../models/UserIndex';

export default {
    get: (token: string) => {
        return new Promise((resolve, reject) => {
            UserIndex.exists({
                token: token
            }).then((exists:boolean) => {
                if (exists) resolve();
                reject('No user exists with this token');
            });
        });
    },
    createIndex: (info: UserIndexCreateFields) => {
        return new Promise((resolve, reject) => {
            UserIndex.create(helpers.rmUndef({
                token: crypto.randomBytes(16).toString("hex"),
                isCritical: info.ic,
                email: info.email,
                _userId: info._id || undefined
            }))
                .then((doc: ifUserIndexDocument) => helpers.sendMail(info.prefix, doc.token, info.email))
                .then(resolve)
                .catch(reject);
        });
    },
    confirm: (token: string) => {
        return new Promise((resolve, reject) => {
            UserIndex.findOne({
                token: token
            }).then((index: ifUserIndexDocument) => {
                if (!index) return reject("no token found");
                else return index;
            }).then((index: ifUserIndexDocument) => async.parallel({
                findUser: (callback) => {
                    User.findOne({
                        _id: index._userId
                    })
                        .then((usr: ifUserDocument) => callback(null, usr))
                        .catch(err => callback(err, null));
                },
                delIndex: (callback) => {
                    index.deleteOne()
                        .then((out: ifUserIndexDocument) => callback(null, out))
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
        });
    },
    listPrunable: (date: Date) => {
        return new Promise((resolve, reject) => {
            UserIndex.find({
                isCritical: true,
                createdAt: {
                    $lt: date
                }
            })
                .then(resolve)
                .catch(reject);
        });
    }
};