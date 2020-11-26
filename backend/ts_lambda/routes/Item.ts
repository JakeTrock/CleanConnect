import helpers from '../helpers';
import Inventory from '../models/Inventory';
import Item from '../models/Item';
import { Callback } from 'aws-lambda';
import { reqBody } from '../interfaces';

const create = async (body: reqBody, callback: Callback): Promise<any> => {
    Inventory.findOne({ where: { id: body.routing.token1 } })
        .then((inv: Inventory | null) =>
            Item.create(helpers.rmUndef({
                name: body.data.name,
                inventory: inv.id,
                maxQuant: body.data.maxQuant,
                minQuant: body.data.minQuant,
                curQuant: body.data.curQuant,
                ip: body.routing.ip
            })))
        .then(() => callback(null, helpers.blankres))
        .catch(e => callback(null, helpers.erep(e)));
}

const remove = async (body: reqBody, callback: Callback): Promise<any> => {
    Item.mark(
        body.routing.token1,
        body.routing.token2,
        true, body.routing.ip)
        .then(() => callback(null, helpers.blankres))
        .catch(e => callback(null, helpers.erep(e)));
}

const restore = async (body: reqBody, callback: Callback): Promise<any> => {
    Item.mark(
        body.routing.token1,
        body.routing.token2,
        false, body.routing.ip)
        .then(() => callback(null, helpers.blankres))
        .catch(e => callback(null, helpers.erep(e)));
}

const updQnt = async (body: reqBody, callback: Callback): Promise<any> => {
    Item.change(
        body.routing.token1,
        body.routing.token2,
        body.data, true)
        .then(() => callback(null, helpers.blankres))
        .catch(e => callback(null, helpers.erep(e)));
}

const edit = async (body: reqBody, callback: Callback): Promise<any> => {
    Item.change(
        body.routing.token1,
        body.routing.token2,
        body.data, false)
        .then(() => callback(null, helpers.blankres))
        .catch(e => callback(null, helpers.erep(e)));
}

export { create, edit, remove, restore, updQnt }