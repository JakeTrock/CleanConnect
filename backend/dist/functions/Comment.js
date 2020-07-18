"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_conf_1 = __importDefault(require("../config/express.conf"));
const cuss_1 = __importDefault(require("cuss"));
const asyncpromise_1 = __importDefault(require("../asyncpromise"));
const Comment_1 = __importDefault(require("../models/Comment"));
const helpers_1 = __importDefault(require("../helpers"));
exports.default = {
    get: (id) => {
        return new Promise((resolve, reject) => {
            Comment_1.default.findById(id)
                .then((cmt) => {
                if (cmt)
                    resolve(cmt);
                reject({ ie: true, message: "No such comment exists!" });
            });
        });
    },
    rmImageDelete: (id) => {
        return new Promise((resolve, reject) => {
            Comment_1.default.find().or([{
                    tag: id
                }, {
                    _id: id
                }]).then((cmt) => asyncpromise_1.default.forEachOf(cmt, (value, key, callback) => asyncpromise_1.default.parallel({
                imageDeletion: (cb) => {
                    if (value.img)
                        express_conf_1.default.gfs.delete(new helpers_1.default.toObjID(value.img))
                            .then(cb())
                            .catch((e) => cb(e));
                },
                commentDeletion: (cb) => {
                    value.deleteOne()
                        .then(cb())
                        .catch(e => cb(e));
                },
            }).catch(callback)))
                .then(() => resolve())
                .catch(reject);
        });
    },
    new: (details, tag) => {
        return new Promise((resolve, reject) => {
            if (details.text.toLowerCase().split(" ").some((r) => cuss_1.default[r] == 2))
                reject({ ie: true, message: "You'll have to clean up your language before we clean up this room." });
            else {
                Comment_1.default.create(helpers_1.default.rmUndef(details))
                    .then((newDoc) => tag.comments.push(newDoc._id))
                    .then(() => tag.save())
                    .then(() => resolve())
                    .catch(reject);
            }
        });
    },
    mark: (fp, status, ip) => {
        return new Promise((resolve, reject) => {
            Comment_1.default.findOneAndUpdate(fp, {
                $set: {
                    markedForDeletion: status,
                    removedAt: status ? new Date() : undefined,
                    deletedBy: ip ? ip : undefined,
                },
            })
                .then(() => resolve())
                .catch(reject);
        });
    }
};
