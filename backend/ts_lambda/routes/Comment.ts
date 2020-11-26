import xss from 'xss-filters';
import helpers from '../helpers';
import Comment from '../models/Comment';
import { APIGatewayEvent, Context, Callback } from 'aws-lambda';
import { imgUplDat } from '../interfaces';

const create = async (event: APIGatewayEvent, context: Context, callback: Callback): Promise<any> => {
    const body=JSON.parse(event.body);
    helpers.uploadImage(body.image.split(",")[1], body.image.split(",")[0].substring(5,body.image.indexOf(";")))
    .then((dat:imgUplDat)=>Comment.create(helpers.rmUndef({
        ip: event.requestContext.identity.sourceIp,
        tag: event.pathParameters.id,
        text: xss.uriQueryInHTMLData(body.text).replace(/%20/g, " "),
        img: (dat.fields.key) ? dat.fields.key : undefined,
        sev: body.sev,
    })))
        .then(() => callback(null, helpers.blankres))
        .catch(e => callback(null, helpers.erep(e)));
}

const remove = async (event: APIGatewayEvent, context: Context, callback: Callback): Promise<any> => {
    Comment.mark(
        event.pathParameters.id,
        event.pathParameters.comment_id,
        true, event.requestContext.identity.sourceIp)
        .then(() => callback(null, helpers.blankres))
        .catch(e => callback(null, helpers.erep(e)));
}

const restore = async (event: APIGatewayEvent, context: Context, callback: Callback): Promise<any> => {
    Comment.mark(
        event.pathParameters.id,
        event.pathParameters.comment_id,
        false, event.requestContext.identity.sourceIp)
        .then(() => callback(null,helpers.blankres))
        .catch(e => callback(null,helpers.erep(e)));
}
export { create, remove, restore };