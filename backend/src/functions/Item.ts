import { ifInventoryDocument, ifItemDocument, ItemChangeInterface, ItemNewInterface, ItemDeleteFindInterface } from '../interfaces';
import { Types } from 'mongoose';
import Item from '../models/Item';
import helpers from '../helpers';

export default {
    get: (id: string) => {
        return new Promise((resolve, reject) => {
            Item.findById(id)
                .then((inv: ifItemDocument) => {
                    if (inv) resolve(inv);
                    reject("No such tag exists!");
                });
        });
    },
    new: (inv: ifInventoryDocument, details: ItemNewInterface) => {
        return new Promise((resolve, reject) => {
            Item.create(helpers.rmUndef(details))
                .then((newDoc: ifItemDocument) => inv.items.push(newDoc._id))
                .then(() => inv.save())
                .then(() => resolve())
                .catch(reject);
        });
    },
    change: (fp: Types.ObjectId, updated: ItemChangeInterface, qupdate: boolean) => {
        return new Promise((resolve, reject) => {
            if (qupdate) updated = {
                maxQuant: undefined,
                minQuant: undefined,
                name: undefined,
                curQuant: updated.curQuant
            };
            Item.findOneAndUpdate({
                _id: fp
            }, updated, {
                omitUndefined: true,
                runValidators: true
            })
                .then(() => resolve())
                .catch(reject);
        });
    },
    mark: (fp: ItemDeleteFindInterface, status: boolean, ip: string) => {
        return new Promise((resolve, reject) => {
            Item.findOneAndUpdate(fp, {
                $set: {
                    markedForDeletion: status,
                    removedAt: status ? new Date() : undefined,
                    deletedBy: ip ? ip : undefined,
                },
            })
                .then(() => resolve())
                .catch(reject);
        });
    },
};