import xss from 'xss-filters';
import helpers from '../helpers';
import Comment from '../models/Comment';
import { APIGatewayEvent, Context, Callback } from 'aws-lambda';
import { imgUplDat } from '../interfaces';

const cmtNew = async (event: APIGatewayEvent, context: Context, callback: Callback): Promise<any> => {
    helpers.uploadImage(event)
    .then((dat:imgUplDat)=>Comment.create(helpers.rmUndef({
        ip: event.requestContext.identity.sourceIp,
        tag: event.pathParameters.id,
        text: xss.uriQueryInHTMLData(JSON.parse(event.body).text).replace(/%20/g, " "),
        img: (dat.fields.key) ? dat.fields.key : undefined,
        sev: JSON.parse(event.body).sev,
    })))
        .then(() => callback(null, helpers.blankres))
        .catch(e => callback(null, helpers.erep(e)));
}

const cmtDelete = async (event: APIGatewayEvent, context: Context, callback: Callback): Promise<any> => {
    Comment.mark(
        event.pathParameters.id,
        event.pathParameters.comment_id,
        true, event.requestContext.identity.sourceIp)
        .then(() => callback(null, helpers.blankres))
        .catch(e => callback(null, helpers.erep(e)));
}

const cmtRestore = async (event: APIGatewayEvent, context: Context, callback: Callback): Promise<any> => {
    Comment.mark(
        event.pathParameters.id,
        event.pathParameters.comment_id,
        false, event.requestContext.identity.sourceIp)
        .then(() => callback(null,helpers.blankres))
        .catch(e => callback(null,helpers.erep(e)));
}
export { cmtNew, cmtRestore, cmtDelete };