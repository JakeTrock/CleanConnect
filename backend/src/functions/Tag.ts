import QRCode from 'qrcode';
import async from '../asyncpromise';
import Comment from '../models/Comment';
import User from '../models/User';
import mongoose, { Types } from 'mongoose';
import { ifTagDocument, ifUserDocument, TagChangeInterface } from '../interfaces';
import Tag from '../models/Tag';
import helpers from '../helpers';
import keys from '../config/keys.json';

export default {
    get: (id: string) => {
        return new Promise((resolve, reject) => {
            Tag.findById(id)
                .then((tag: ifTagDocument) => {
                    if (tag) resolve(tag);
                    reject({ ie: true, message: "No such tag exists!" });
                });
        });
    },
    getall: (userID: Types.ObjectId, sd: boolean) => {
        return new Promise((resolve, reject) => {
            User.findById(userID)
                .populate({
                    path: 'tags',
                    populate: {
                        path: 'comments',
                        model: 'Comment',
                        match: {
                            markedForDeletion: sd
                        }
                    }
                })
                .then((user: ifUserDocument) => resolve(user.tags))
                .catch(reject);
        });
    },
    new: (name: string, user: ifUserDocument) => {
        return new Promise((resolve, reject) => {
            if (user.tags.length <= keys.tagCeilings[user.tier]) {
                const id = new mongoose.mongo.ObjectId();
                QRCode.toDataURL(process.env.domainPrefix + process.env.topLevelDomain + "/tag/" + id)
                    .then(qr => Tag.create(helpers.rmUndef({
                        _id: id,
                        name: name,
                        user: user._id,
                        qrcode: qr
                    })))
                    .then((newDoc: ifTagDocument) => user.tags.push(newDoc._id))
                    .then(() => user.save())
                    .then(() => resolve())
                    .catch(reject);
            } else
                reject('You have hit the tag limit for this tier, please consider upgrading');
        });
    },
    change: (id: Types.ObjectId, updated: TagChangeInterface) => {
        return new Promise((resolve, reject) => {
            Tag.findByIdAndUpdate(id, {
                name: updated.name
            }, {
                runValidators: true
            })
                .then(() => resolve())
                .catch(reject);
        });
    },
    removal: (id: Types.ObjectId, uid: Types.ObjectId) => {
        return new Promise((resolve, reject) => {
            async.parallel({
                Comment: (cb) => Comment.rmImageDelete(id)
                    .then(cb())
                    .catch(cb),
                Tag: (cb) => Tag.deleteOne({
                    _id: id
                })
                    .then(cb())
                    .catch(cb),
                User: (cb) => User.removeItem(id, uid, "tags")
                    .then(cb())
                    .catch(cb)
            }).then(() => resolve())
                .catch(reject);
        });
    },
    purge: (userID: Types.ObjectId) => {
        return new Promise((resolve, reject) => {
            Tag.find({
                user: userID
            }).then((inv: ifTagDocument[]) =>
                async.forEachOf(inv, (value: ifTagDocument, key: Number, callback) => {
                    async.parallel({
                        Comments: (cb) => Comment.rmImageDelete(value._id)
                            .then(cb())
                            .catch(cb),
                        Tag: (cb) => Tag.findByIdAndDelete(value._id)
                            .then(cb())
                            .catch(cb),
                        User: (cb) => User.removeItem(userID, value._id, "tags")
                            .then(cb())
                            .catch(cb)
                    })
                        .then(callback())
                        .catch(callback);
                }))
                .then(() => resolve())
                .catch(reject);
        });
    }
};