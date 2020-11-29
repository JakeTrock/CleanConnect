// import QRCode from 'qrcode';
var QRCode = require('qrcode');

import Item from '../models/Item';
import User from '../models/User';
import Inventory from '../models/Inventory';
import helpers from '../helpers';
import keys from '../config/keys';
import { v4 as uuidv4 } from 'uuid';
import { sharedGet, sharedGetAll } from './shared';

const get = async (id: string): Promise<any> => sharedGet(Inventory, id);

const getall = async (userID: string, sd: boolean): Promise<any> => sharedGetAll("invs", userID, sd);

const newInv = async (name: String, user: User): Promise<any> => {
    return new Promise((resolve, reject) => {
        Inventory.count({ where: { user: user.id } })
            .then(invct => {
                if (invct <= keys.tagCeilings[user.tier]) {
                    const id = uuidv4();
                    QRCode.toDataURL(process.env.domain + "/dash/inventory/" + id, { errorCorrectionLevel: 'H' })
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

export { get, getall, newInv, removal };