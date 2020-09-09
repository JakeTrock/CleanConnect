import QRCode from 'qrcode';
import Item from '../models/Item';
import User from '../models/User';
import Inventory from '../models/Inventory';
import async from '../asyncpromise';
import { InventoryChangeInterface } from '../interfaces';
import helpers from '../helpers';
import keys from '../config/keys';
import { v4 as uuidv4 } from 'uuid';

const get = async (id: string): Promise<any> => {
    return new Promise((resolve, reject) => {
        Inventory.findOne({ where: { id: id } })
            .then((inv: Inventory | null) => {
                if (inv) resolve(inv);
                reject({ message: "No such inventory exists!" });
            });
    });
}
const getall = async (userID: string, sd: boolean): Promise<any> => {
    return new Promise((resolve, reject) => {
        User.findOne({ where: { id: userID } })
            .then(usr => {
                return usr.invs.map(e => e.items.filter(a => a.markedForDeletion == sd))
            })
            .then(resolve)
            .catch(reject);
    });
}
const newInv = async (name: String, user: User): Promise<any> => {
    return new Promise((resolve, reject) => {
        Inventory.count({ where: { user: user.id } })
            .then(invct => {
                if (invct <= keys.tagCeilings[user.tier]) {
                    const id = uuidv4();
                    QRCode.toDataURL(process.env.domainPrefix + process.env.topLevelDomain + "/dash/inventory/" + id, { errorCorrectionLevel: 'H' })
                        .then(qr => Inventory.create(helpers.rmUndef({
                            id: id,
                            name: name,
                            user: user.id,
                            qrcode: qr
                        })))
                        .then(() => resolve())
                        .catch(reject);
                } else
                    reject('You have hit the inventory limit for this tier, please consider upgrading');
            });
    });
}
const change = async (id: string, updated: InventoryChangeInterface): Promise<any> => {
    return new Promise((resolve, reject) => {
        Inventory.findOne({
            where: { id: id }
        }).then(inv => inv.update(updated))
            .then(() => resolve())
            .catch(reject);
    });
}
const removal = async (id: string, user: User): Promise<any> => {
    return new Promise((resolve, reject) => {
        Promise.allSettled([
            Item.destroy({
                where: { inventory: id }
            }),
            Inventory.destroy({
                where: { id: id }
            }),
        ]).then(() => resolve())
            .catch(reject);
    });
}
const purge = async (userID: string): Promise<any> => {
    return new Promise((resolve, reject) => {
        Inventory.findAll({
            where: { user: userID }
        }).then((inv: Inventory[]) =>
            async.forEachOf(inv, (value: Inventory, key: number, callback: (err?: Error) => void) =>
                Promise.allSettled([
                    Item.destroy({
                        where: { inventory: value.id }
                    }),
                    Inventory.destroy({
                        where: { id: value.id }
                    })
                ])
                    .then(() => callback())
                    .catch(callback)))
            .then(() => resolve())
            .catch(reject);
    });
}

export { get, getall, newInv, change, removal, purge };