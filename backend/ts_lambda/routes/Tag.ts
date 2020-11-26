import helpers from '../helpers';
import User from '../models/User';
import Tag from '../models/Tag';
import { Callback } from 'aws-lambda';
import { reqBody } from '../interfaces';

const create = async (body: reqBody, callback: Callback): Promise<any> => {
    helpers.passport(body.routing.authorization)
        .then(usr => User.findOne({ where: { id: usr.id } }))
        .then((usr: User | null) => Tag.newTag(body.data.name, usr))
        .then(() => callback(null, helpers.blankres))
        .catch(e => callback(null, helpers.erep(e)));
}

const getAll = async (body: reqBody, callback: Callback): Promise<any> => {
    helpers.passport(body.routing.authorization)
        .then(usr => Tag.getall(usr.id, body.data.showDead))
        .then(out => callback(null, helpers.scadd({ tags: out })))
        .catch(e => callback(null, helpers.erep(e)));
}

const getOne = async (body: reqBody, callback: Callback): Promise<any> => {
    helpers.passport(body.routing.authorization)
        .then(() => Tag.get(body.routing.token1))
        .then((out: Tag) => callback(null, helpers.scadd(out)))
        .catch(e => callback(null, helpers.erep(e)));
}

const exists = async (body: reqBody, callback: Callback): Promise<any> => {
    Tag.count({ where: { id: body.routing.token1 } })
        .then((out: number) => callback(null, JSON.stringify({ success: out != 0 })))
        .catch(e => callback(null, helpers.erep(e)));
}

const edit = async (body: reqBody, callback: Callback): Promise<any> => {
    helpers.passport(body.routing.authorization)
        .then(() => Tag.update({
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
        .then((usr: User | null) => Tag.removal(body.routing.token1, usr.id))
        .then(() => callback(null, helpers.blankres))
        .catch(e => callback(null, helpers.erep(e)));
}

export { create, getAll, getOne, exists, edit, remove };