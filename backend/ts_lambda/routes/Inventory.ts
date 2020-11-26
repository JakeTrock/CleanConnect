import helpers from '../helpers';
import Inventory from '../models/Inventory';
import User from '../models/User';
import { Callback } from 'aws-lambda';
import { reqBody } from '../interfaces';

const getAll = async (body: reqBody, callback: Callback): Promise<any> => {
    helpers.passport(body.routing.authorization)
        .then(usr => Inventory.getall(usr.id, body.data.showDead))
        .then(out => callback(null, helpers.scadd({ invs: out })))
        .catch(e => callback(null, helpers.erep(e)));
}

const getOne = async (body: reqBody, callback: Callback): Promise<any> => {
    helpers.passport(body.routing.authorization)
        .then(() => Inventory.get(body.routing.token1))
        .then(out => callback(null, helpers.scadd(out)))
        .catch(e => callback(null, helpers.erep(e)));
}

const exists = async (body: reqBody, callback: Callback): Promise<any> => {
    Inventory.count({
        where: { id: body.routing.token1 }
    })
        .then((out: number) => callback(null, JSON.stringify({ success: out != 0 })))
        .catch(e => callback(null, helpers.erep(e)));
}

const create = async (body: reqBody, callback: Callback): Promise<any> => {
    helpers.passport(body.routing.authorization)
        .then(() => User.findOne({
            where: { id: body.routing.token1 }
        }))
        .then((usr: User | null) => Inventory.newInv(body.data.name, usr))
        .then(() => callback(null, helpers.blankres))
        .catch(e => callback(null, helpers.erep(e)));
}

const edit = async (body: reqBody, callback: Callback): Promise<any> => {
    helpers.passport(body.routing.authorization)
        .then(() => Inventory.update({ 
            name: body.data.name 
        }, {
            where: { id: body.routing.token1 }
        }))
        .then(() => callback(null, helpers.blankres))
        .catch(e => callback(null, helpers.erep(e)));
}

const remove = async (body: reqBody, callback: Callback): Promise<any> => {
    helpers.passport(body.routing.authorization)
        .then(usr => User.findOne({
            where: { id: usr.id }
        }))
        .then((usr: User | null) => Inventory.removal(body.routing.token1, usr))
        .then(() => callback(null, helpers.blankres))
        .catch(e => callback(null, helpers.erep(e)));
}


export { remove, edit, exists, getAll, getOne, create };