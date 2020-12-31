import { ItemChangeInterface } from '../interfaces';
import Item from '../models/Item';
import { sharedGet } from './shared';

const get = async (id: string): Promise<any> => sharedGet(Item, id);

const change = async (inv: string, itid: string, updated: ItemChangeInterface, qupdate: boolean): Promise<any> => {
    return new Promise((resolve, reject) => {
        if (qupdate) updated = {
            maxQuant: undefined,
            minQuant: undefined,
            name: undefined,
            curQuant: updated.curQuant
        };
        Item.findOne({
            where: { inventory: inv, id: itid }
        }).then(itm => itm.update(updated))
            .then(() => resolve(true))
            .catch(reject);
    });
}
const mark = async (invid: string, id: string, status: boolean, ip: string): Promise<any> => {
    return new Promise((resolve, reject) => {
        Item.findOne({
            where: {
                inventory: invid,
                id: id,
            }
        }).then(itm => itm.update({
            markedForDeletion: status,
            removedAt: status ? new Date() : undefined,
            ip: ip ? ip : undefined
        }))
            .then(() => resolve(true))
            .catch(reject);
    });
}

export { get, change, mark };