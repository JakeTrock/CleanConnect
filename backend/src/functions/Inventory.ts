import QRCode from 'qrcode';
import Item from '../models/Item';
import User from '../models/User';
import async from '../asyncpromise';
import mongoose, { Types } from 'mongoose';
import { ifInventoryDocument, ifUserDocument, InventoryChangeInterface } from '../interfaces';
import Inventory from '../models/Inventory';
import helpers from '../helpers';
import keys from '../config/keys.json';

export default {
    get: (id: string) => new Promise((resolve, reject) => {
        Inventory.findById(id)
            .then((inv: ifInventoryDocument | null) => {
                if (inv) resolve(inv);
                reject({ ie: true, message: "No such inventory exists!" });
            });
    }),
    getall: (userID: Types.ObjectId, sd: boolean) => new Promise((resolve, reject) => {
        User.findById(userID)
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
            .then((user: ifUserDocument | null) => resolve(user.invs))
            .catch(reject);
    }),
    new: (name: String, user: ifUserDocument) => new Promise((resolve, reject) => {
        if (user.invs.length <= keys.tagCeilings[user.tier]) {
            const id = new mongoose.mongo.ObjectId();
            QRCode.toDataURL(process.env.domainPrefix + process.env.topLevelDomain + "/dash/inventory/" + id)
                .then(qr => Inventory.create(helpers.rmUndef({
                    _id: id,
                    name: name,
                    user: user._id,
                    qrcode: qr
                })))
                .then((newDoc: ifInventoryDocument) => user.invs.push(newDoc._id))
                .then(() => user.save())
                .then(() => resolve())
                .catch(reject);
        } else
            reject('You have hit the inventory limit for this tier, please consider upgrading');
    }),
    change: (id: Types.ObjectId, updated: InventoryChangeInterface) => new Promise((resolve, reject) => {
        Inventory.findOneAndUpdate({
            _id: id
        }, updated, {
            omitUndefined: true,
            runValidators: true
        })
            .then(() => resolve())
            .catch(reject);
    }),
    removal: (id: Types.ObjectId, user: ifUserDocument) => new Promise((resolve, reject) => {
        async.parallel({
            Item: (cb: (err?: Error) => void) => Item.deleteMany({
                inventory: id
            })
                .then(() => cb())
                .catch(cb),
            Tag: (cb: (err?: Error) => void) => Inventory.deleteOne({
                _id: id
            })
                .then(() => cb())
                .catch(cb),
            User: (cb: (err?: Error) => void) => User.removeItem(user._id, id, "invs")
                .then(() => cb())
                .catch(cb)
        }).then(() => resolve())
            .catch(reject);
    }),
    purge: (userID: Types.ObjectId) => new Promise((resolve, reject) => {
        Inventory.find({
            user: userID
        }).then((inv: ifInventoryDocument[]) =>
            async.forEachOf(inv, (value: ifInventoryDocument, key: Number, callback: (err?: Error) => void) =>
                async.parallel({
                    Items: (cb: (err?: Error) => void) => Item.deleteMany({
                        inventory: value._id
                    })
                        .then(() => cb())
                        .catch(cb),
                    Invs: (cb: (err?: Error) => void) => Inventory.findByIdAndDelete(value._id).
                        then(() => cb())
                        .catch(cb),
                    User: (cb: (err?: Error) => void) => User.removeItem(userID, value._id, "invs")
                        .then(() => cb())
                        .catch(cb)
                })
                    .then(callback())
                    .catch(callback)))
            .then(() => resolve())
            .catch(reject);
    })
};