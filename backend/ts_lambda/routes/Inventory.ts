import helpers from '../helpers';
import Inventory from '../models/Inventory';
import User from '../models/User';
import { APIGatewayEvent, Context, Callback } from 'aws-lambda';

const invGetAll = async (event: APIGatewayEvent, context: Context, callback: Callback): Promise<any> => {
    helpers.passport(event)
        .then(usr => Inventory.getall(usr.id, JSON.parse(event.body).showDead))
        .then(out => callback(null, helpers.scadd({ invs: out })))
        .catch(e => callback(null, helpers.erep(e)));
}

const invGetOne = async (event: APIGatewayEvent, context: Context, callback: Callback): Promise<any> => {
    helpers.passport(event)
        .then(() => Inventory.get(event.pathParameters.id))
        .then(out => callback(null, helpers.scadd(out)))
        .catch(e => callback(null, helpers.erep(e)));
}

const invExist = async (event: APIGatewayEvent, context: Context, callback: Callback): Promise<any> => {
    Inventory.count({
        where: { id: event.pathParameters.id }
    })
        .then((out: number) => callback(null, JSON.stringify({ success: out != 0 })))
        .catch(e => callback(null, helpers.erep(e)));
}

const invNew = async (event: APIGatewayEvent, context: Context, callback: Callback): Promise<any> => {
    helpers.passport(event)
        .then(() => User.findOne({
            where: { id: event.pathParameters.id }
        }))
        .then((usr: User | null) => Inventory.newInv(JSON.parse(event.body).name, usr))
        .then(() => callback(null, helpers.blankres))
        .catch(e => callback(null, helpers.erep(e)));
}

const invEdit = async (event: APIGatewayEvent, context: Context, callback: Callback): Promise<any> => {
    helpers.passport(event)
        .then(() => Inventory.update({
            where: { id: event.pathParameters.id }
        }, JSON.parse(event.body)))
        .then(() => callback(null, helpers.blankres))
        .catch(e => callback(null, helpers.erep(e)));
}

const invDelete = async (event: APIGatewayEvent, context: Context, callback: Callback): Promise<any> => {
    helpers.passport(event)
        .then(usr => User.findOne({
            where: { id: usr.id }
        }))
        .then((usr: User | null) => Inventory.removal(event.pathParameters.id, usr))
        .then(() => callback(null, helpers.blankres))
        .catch(e => callback(null, helpers.erep(e)));
}


export { invDelete, invEdit, invExist, invGetAll, invGetOne, invNew };