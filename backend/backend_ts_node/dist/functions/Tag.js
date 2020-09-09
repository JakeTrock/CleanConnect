"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const qrcode_1 = __importDefault(require("qrcode"));
const asyncpromise_1 = __importDefault(require("../asyncpromise"));
const Comment_1 = __importDefault(require("../models/Comment"));
const User_1 = __importDefault(require("../models/User"));
const mongoose_1 = __importDefault(require("mongoose"));
const Tag_1 = __importDefault(require("../models/Tag"));
const helpers_1 = __importDefault(require("../helpers"));
const keys_json_1 = __importDefault(require("../config/keys.json"));
exports.default = {
    get: (id) => new Promise((resolve, reject) => {
        Tag_1.default.findById(id)
            .then((tag) => {
            if (tag)
                resolve(tag);
            reject({ ie: true, message: "No such tag exists!" });
        });
    }),
    getall: (userID, sd) => new Promise((resolve, reject) => {
        User_1.default.findById(userID)
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
            .then((user) => resolve(user.tags))
            .catch(reject);
    }),
    new: (name, user) => new Promise((resolve, reject) => {
        if (user.tags.length <= keys_json_1.default.tagCeilings[user.tier]) {
            const id = new mongoose_1.default.mongo.ObjectId();
            qrcode_1.default.toDataURL(process.env.domainPrefix + process.env.topLevelDomain + "/tag/" + id)
                .then(qr => Tag_1.default.create(helpers_1.default.rmUndef({
                _id: id,
                name: name,
                user: user._id,
                qrcode: qr
            })))
                .then((newDoc) => user.tags.push(newDoc._id))
                .then(() => user.save())
                .then(() => resolve())
                .catch(reject);
        }
        else
            reject('You have hit the tag limit for this tier, please consider upgrading');
    }),
    change: (id, updated) => new Promise((resolve, reject) => {
        Tag_1.default.findByIdAndUpdate(id, {
            name: updated.name
        }, {
            runValidators: true
        })
            .then(() => resolve())
            .catch(reject);
    }),
    removal: (id, uid) => new Promise((resolve, reject) => {
        asyncpromise_1.default.parallel({
            Comment: (cb) => Comment_1.default.rmImageDelete(id)
                .then(() => cb())
                .catch(cb),
            Tag: (cb) => Tag_1.default.deleteOne({
                _id: id
            })
                .then(() => cb())
                .catch(cb),
            User: (cb) => User_1.default.removeItem(id, uid, "tags")
                .then(() => cb())
                .catch(cb)
        }).then(() => resolve())
            .catch(reject);
    }),
    purge: (userID) => new Promise((resolve, reject) => {
        Tag_1.default.find({
            user: userID
        }).then((inv) => asyncpromise_1.default.forEachOf(inv, (value, key, callback) => {
            asyncpromise_1.default.parallel({
                Comments: (cb) => Comment_1.default.rmImageDelete(value._id)
                    .then(() => cb())
                    .catch(cb),
                Tag: (cb) => Tag_1.default.findByIdAndDelete(value._id)
                    .then(() => cb())
                    .catch(cb),
                User: (cb) => User_1.default.removeItem(userID, value._id, "tags")
                    .then(() => cb())
                    .catch(cb)
            })
                .then(() => callback())
                .catch(callback);
        }))
            .then(() => resolve())
            .catch(reject);
    })
};
