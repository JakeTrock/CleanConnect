import * as crypto from 'crypto';
import helpers from '../helpers';
import User from '../models/User';
import UserIndex from '../models/UserIndex';
import { UserIndexCreateFields } from '../interfaces';


const get = async (token: string): Promise<any> => {
    return new Promise((resolve, reject) => {
        UserIndex.findOne({
            where: { token: token }
        }).then((exists: UserIndex | null) => {
            if (exists) resolve();
            reject('No user exists with this token');
        });
    });
}
const createIndex = async (info: UserIndexCreateFields): Promise<any> => {
    return new Promise((resolve, reject) => {
        UserIndex.create(helpers.rmUndef({
            isCritical: info.ic,
            email: info.email,
            userID: info.id || undefined
        }))
            .then((doc: UserIndex) => helpers.sendMail(info.prefix, doc.id, info.email))
            .then(resolve)
            .catch(reject);
    });
}
const confirm = async (token: string): Promise<any> => {
    return new Promise((resolve, reject) => {
        UserIndex.findOne({
            where: { id: token }
        }).then((index: UserIndex | null) => Promise.allSettled([
            User.findOne({
                where: { id: index.userID }
            }),
            index.destroy(),
        ])).then((user: Array<any>) => {//TODO:interface
            if (user[1].isCritical) {
                user[0].update({
                    isVerified: true
                }).then(() => resolve());
            } else {
                resolve(user[0]);
            }
        })
            .catch(reject);
    });
}

export { get, createIndex, confirm };