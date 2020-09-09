import helpers from '../helpers';
import Inventory from '../models/Inventory';
import Item from '../models/Item';
import { APIGatewayEvent, Context, Callback } from 'aws-lambda';

const itmNew = async (event: APIGatewayEvent, context: Context, callback: Callback): Promise<any> => {
    const body = JSON.parse(event.body);
    Inventory.findOne({ where: { id: event.pathParameters.id } })
        .then((inv: Inventory | null) =>
            Item.create(helpers.rmUndef({
                name: body.name,
                inventory: inv.id,
                maxQuant: body.maxQuant,
                minQuant: body.minQuant,
                curQuant: body.curQuant,
                ip: event.requestContext.identity.sourceIp
            })))
        .then(() => callback(null, helpers.blankres))
        .catch(e => callback(null, helpers.erep(e)));
}

const itmDel = async (event: APIGatewayEvent, context: Context, callback: Callback): Promise<any> => {
    Item.mark(
        event.pathParameters.id,
        event.pathParameters.item_id,
        true, event.requestContext.identity.sourceIp)
        .then(() => callback(null, helpers.blankres))
        .catch(e => callback(null, helpers.erep(e)));
}

const itmRestore = async (event: APIGatewayEvent, context: Context, callback: Callback): Promise<any> => {
    Item.mark(
        event.pathParameters.id,
        event.pathParameters.item_id,
        false, event.requestContext.identity.sourceIp)
        .then(() => callback(null, helpers.blankres))
        .catch(e => callback(null, helpers.erep(e)));
}

const itmUpdQnt = async (event: APIGatewayEvent, context: Context, callback: Callback): Promise<any> => {
    Item.change(
        event.pathParameters.id,
        event.pathParameters.item_id,
        JSON.parse(event.body), true)
        .then(() => callback(null, helpers.blankres))
        .catch(e => callback(null, helpers.erep(e)));
}

const itmChange = async (event: APIGatewayEvent, context: Context, callback: Callback): Promise<any> => {
    Item.change(
        event.pathParameters.id,
        event.pathParameters.item_id,
    JSON.parse(event.body), false)
        .then(() => callback(null, helpers.blankres))
        .catch(e => callback(null, helpers.erep(e)));
}

export { itmNew, itmDel, itmRestore, itmUpdQnt, itmChange }