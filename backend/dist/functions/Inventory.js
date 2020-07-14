"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const qrcode_1 = __importDefault(require("qrcode"));
const Item_1 = __importDefault(require("../models/Item"));
const User_1 = __importDefault(require("../models/User"));
const asyncpromise_1 = __importDefault(require("../asyncpromise"));
const mongoose_1 = __importDefault(require("mongoose"));
const Inventory_1 = __importDefault(require("../models/Inventory"));
const helpers_1 = __importDefault(require("../helpers"));
const keys_json_1 = __importDefault(require("../config/keys.json"));
exports.default = {
    get: (id) => {
        return new Promise((resolve, reject) => {
            Inventory_1.default.findById(id)
                .then((inv) => {
                if (inv)
                    resolve(inv);
                reject("No such inventory exists!");
            });
        });
    },
    getall: (userID, sd) => {
        return new Promise((resolve, reject) => {
            User_1.default.findById(userID)
                .populate({
                path: 'invs',
                populate: {
                    path: 'items',
                    model: 'Item',
                    match: {
                        markedForDeletion: sd
                    }
                }
            })
                .then((user) => resolve(user.invs))
                .catch(reject);
        });
    },
    new: (name, user) => {
        return new Promise((resolve, reject) => {
            if (user.invs.length <= keys_json_1.default.tagCeilings[user.tier]) {
                const id = new mongoose_1.default.mongo.ObjectId();
                qrcode_1.default.toDataURL(process.env.domainPrefix + process.env.topLevelDomain + "/dash/inventory/" + id)
                    .then(qr => Inventory_1.default.create(helpers_1.default.rmUndef({
                    _id: id,
                    name: name,
                    user: user._id,
                    qrcode: qr
                })))
                    .then((newDoc) => user.invs.push(newDoc._id))
                    .then(() => user.save())
                    .then(() => resolve())
                    .catch(reject);
            }
            else {
                reject('You have hit the inventory limit for this tier, please consider upgrading');
            }
        });
    },
    change: (id, updated) => {
        return new Promise((resolve, reject) => {
            Inventory_1.default.findOneAndUpdate({
                _id: id
            }, updated, {
                omitUndefined: true,
                runValidators: true
            })
                .then(() => resolve())
                .catch(reject);
        });
    },
    removal: (id, user) => {
        return new Promise((resolve, reject) => {
            asyncpromise_1.default.parallel({
                Item: (cb) => Item_1.default.deleteMany({
                    inventory: id
                }).then(() => cb()).catch(cb),
                Tag: (cb) => Inventory_1.default.deleteOne({
                    _id: id
                }).then(() => cb()).catch(cb),
                User: (cb) => User_1.default.removeInv(user._id, id).then(() => cb()).catch(cb)
            }).then(() => resolve())
                .catch(reject);
        });
    },
    purge: (userID) => {
        return new Promise((resolve, reject) => {
            Inventory_1.default.find({
                user: userID
            }).then((inv) => asyncpromise_1.default.forEachOf(inv, (value, key, callback) => asyncpromise_1.default.parallel({
                Items: (cb) => Item_1.default.deleteMany({
                    inventory: value._id
                }).then(() => cb()).catch(cb),
                Invs: (cb) => Inventory_1.default.findByIdAndDelete(value._id).then(() => cb()).catch(cb),
                User: (cb) => User_1.default.removeInv(userID, value._id).then(() => cb()).catch(cb)
            }).then(callback()).catch(callback)))
                .then(() => resolve())
                .catch(reject);
        });
    }
};
