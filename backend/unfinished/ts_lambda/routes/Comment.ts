import xss from 'xss-filters';
import helpers from '../helpers';
import Comment from '../models/Comment';
import { Callback } from 'aws-lambda';
import { reqBody } from '../interfaces';

const create = async (body: reqBody, callback: Callback): Promise<any> => {
    helpers.uploadImage(body.data.image.split(",")[1], body.data.image.split(",")[0].substring(5,body.data.image.indexOf(";")))
    .then((dat:string)=>Comment.create(helpers.rmUndef({
        ip: body.routing.ip,
        tag: body.routing.token1,
        text: xss.uriQueryInHTMLData(body.data.text).replace(/%20/g, " "),
        img: (dat) ? dat : undefined,
        sev: body.data.sev,
    })))
        .then(() => callback(null, helpers.blankres))
        .catch(e => callback(null, helpers.erep(e)));
}

const remove = async (body: reqBody, callback: Callback): Promise<any> => {
    Comment.mark(
        body.routing.token1,
        body.routing.token2,
        true, body.routing.ip)
        .then(() => callback(null, helpers.blankres))
        .catch(e => callback(null, helpers.erep(e)));
}

const restore = async (body: reqBody, callback: Callback): Promise<any> => {
    Comment.mark(
        body.routing.token1,
        body.routing.token2,
        false, body.routing.ip)
        .then(() => callback(null,helpers.blankres))
        .catch(e => callback(null,helpers.erep(e)));
}
export { create, remove, restore };