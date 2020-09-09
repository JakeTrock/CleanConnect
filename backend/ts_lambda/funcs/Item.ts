import { ItemChangeInterface } from '../interfaces';
import Item from '../models/Item';

const get = async (id: string): Promise<any> => {
    return new Promise((resolve, reject) => {
        Item.findOne({ where: { id: id } })
            .then((inv: Item | null) => {
                if (inv) resolve(inv);
                reject({ message: "No such tag exists!" });
            });
    });
}
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
            .then(() => resolve())
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
            .then(() => resolve())
            .catch(reject);
    });
}

export { get, change, mark };