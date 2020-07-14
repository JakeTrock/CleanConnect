"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const crypto = __importStar(require("crypto"));
const helpers_1 = __importDefault(require("../helpers"));
const asyncpromise_1 = __importDefault(require("../asyncpromise"));
const User_1 = __importDefault(require("../models/User"));
const UserIndex_1 = __importDefault(require("../models/UserIndex"));
exports.default = {
    get: (token) => {
        return new Promise((resolve, reject) => {
            UserIndex_1.default.findOne({
                token: token
            }).then((index) => {
                if (index.token)
                    resolve();
                reject('No user exists with this token');
            });
        });
    },
    createIndex: (info) => {
        return new Promise((resolve, reject) => {
            UserIndex_1.default.create(helpers_1.default.rmUndef({
                token: crypto.randomBytes(16).toString("hex"),
                isCritical: info.ic,
                email: info.email,
                _userId: info._id || undefined
            }))
                .then((doc) => helpers_1.default.sendMail(info.prefix, doc.token, info.email))
                .then(resolve)
                .catch(reject);
        });
    },
    confirm: (token) => {
        return new Promise((resolve, reject) => {
            UserIndex_1.default.findOne({
                token: token
            }).then((index) => {
                if (!index)
                    return reject("no token found");
                else {
                    return index;
                }
            }).then((index) => asyncpromise_1.default.parallel({
                findUser: (callback) => {
                    User_1.default.findOne({
                        _id: index._userId
                    })
                        .then((usr) => callback(null, usr))
                        .catch(err => callback(err, null));
                },
                delIndex: (callback) => {
                    index.deleteOne()
                        .then((out) => callback(null, out))
                        .catch(err => callback(err, null));
                }
            })).then((user) => {
                if (user.delIndex.isCritical) {
                    user.findUser.updateOne({
                        $set: {
                            isVerified: true
                        }
                    }).then(() => resolve());
                }
                else {
                    resolve(user.findUser);
                }
            })
                .catch(reject);
        });
    },
    listPrunable: (date) => {
        return new Promise((resolve, reject) => {
            UserIndex_1.default.find({
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
