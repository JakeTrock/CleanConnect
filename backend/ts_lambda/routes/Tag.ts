import helpers from '../helpers';
import User from '../models/User';
import Tag from '../models/Tag';
import { APIGatewayEvent, Context, Callback } from 'aws-lambda';

const tagNew = async (event: APIGatewayEvent, context: Context, callback: Callback): Promise<any> => {
    helpers.passport(event)
        .then(usr => User.findOne({ where: { id: usr.id } }))
        .then((usr: User | null) => Tag.newTag(JSON.parse(event.body).name, usr))
        .then(() => callback(null, helpers.blankres))
        .catch(e => callback(null, helpers.erep(e)));
}

const tagGetAll = async (event: APIGatewayEvent, context: Context, callback: Callback): Promise<any> => {
    helpers.passport(event)
        .then(usr => Tag.getall(usr.id, JSON.parse(event.body).showDead))
        .then(out => callback(null, helpers.scadd({ tags: out })))
        .catch(e => callback(null, helpers.erep(e)));
}

const tagGetOne = async (event: APIGatewayEvent, context: Context, callback: Callback): Promise<any> => {
    helpers.passport(event)
        .then(() => Tag.get(event.pathParameters.id))
        .then((out: Tag) => callback(null, helpers.scadd(out)))
        .catch(e => callback(null, helpers.erep(e)));
}

const tagExists = async (event: APIGatewayEvent, context: Context, callback: Callback): Promise<any> => {
    Tag.count({ where: { id: event.pathParameters.id } })
        .then((out: number) => callback(null, JSON.stringify({ success: out != 0 })))
        .catch(e => callback(null, helpers.erep(e)));
}

const tagChange = async (event: APIGatewayEvent, context: Context, callback: Callback): Promise<any> => {
    helpers.passport(event)
        .then(() => Tag.change(event.pathParameters.id, JSON.parse(event.body)))
        .then(() => callback(null, helpers.blankres))
        .catch(e => callback(null, helpers.erep(e)));
}

const tagDelete = async (event: APIGatewayEvent, context: Context, callback: Callback): Promise<any> => {
    helpers.passport(event)
        .then(usr => User.findOne({ where: { id: usr.id } }))
        .then((usr: User | null) => Tag.removal(event.pathParameters.id, usr.id))
        .then(() => callback(null, helpers.blankres))
        .catch(e => callback(null, helpers.erep(e)));
}

export { tagNew, tagGetAll, tagGetOne, tagExists, tagChange, tagDelete };