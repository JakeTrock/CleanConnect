"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const Item_1 = __importDefault(require("../models/Item"));
const helpers_1 = __importDefault(require("../helpers"));
exports.default = {
    get: (id) => new Promise((resolve, reject) => {
        Item_1.default.findById(id)
            .then((inv) => {
            if (inv)
                resolve(inv);
            reject({ ie: true, message: "No such tag exists!" });
        });
    }),
    new: (inv, details) => new Promise((resolve, reject) => {
        Item_1.default.create(helpers_1.default.rmUndef(details))
            .then((newDoc) => inv.items.push(newDoc._id))
            .then(() => inv.save())
            .then(() => resolve())
            .catch(reject);
    }),
    change: (fp, updated, qupdate) => new Promise((resolve, reject) => {
        if (qupdate)
            updated = {
                maxQuant: undefined,
                minQuant: undefined,
                name: undefined,
                curQuant: updated.curQuant
            };
        Item_1.default.findOneAndUpdate({
            _id: fp
        }, updated, {
            omitUndefined: true,
            runValidators: true
        })
            .then(() => resolve())
            .catch(reject);
    }),
    mark: (fp, status, ip) => new Promise((resolve, reject) => {
        Item_1.default.findOneAndUpdate(fp, {
            $set: {
                markedForDeletion: status,
                removedAt: status ? new Date() : undefined,
                deletedBy: ip ? ip : undefined,
            },
        })
            .then(() => resolve())
            .catch(reject);
    }),
};
