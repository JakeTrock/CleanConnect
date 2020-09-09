import { APIGatewayEvent, Context, Callback } from 'aws-lambda';

import * as Comment from './routes/Comment';
const cmtRt = async (event: APIGatewayEvent, context: Context, callback: Callback): Promise<any> =>
    Comment[event.pathParameters.opname](event, context, callback);

import * as Inventory from './routes/Inventory';
const invRt = async (event: APIGatewayEvent, context: Context, callback: Callback): Promise<any> =>
    Inventory[event.pathParameters.opname](event, context, callback);

import * as Item from './routes/Item';
const itmRt = async (event: APIGatewayEvent, context: Context, callback: Callback): Promise<any> =>
    Item[event.pathParameters.opname](event, context, callback);

import * as Tag from './routes/Tag';
const tagRt = async (event: APIGatewayEvent, context: Context, callback: Callback): Promise<any> =>
    Tag[event.pathParameters.opname](event, context, callback);

import * as User from './routes/User';
const usrRt = async (event: APIGatewayEvent, context: Context, callback: Callback): Promise<any> =>
    User[event.pathParameters.opname](event, context, callback);

export { cmtRt, invRt, itmRt, tagRt, usrRt };