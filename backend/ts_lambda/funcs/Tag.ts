// import QRCode from 'qrcode';
const QRCode = require('qrcode');
import Comment from '../models/Comment';
import User from '../models/User';
import Tag from '../models/Tag';
import helpers from '../helpers';
import keys from '../config/keys';
import { v4 as uuidv4 } from 'uuid';
import { sharedGet, sharedGetAll } from './shared';

const get = async (id: string): Promise<any> => sharedGet(Tag, id);

const getall = async (userID: string, sd: boolean): Promise<any> => sharedGetAll("tags", userID, sd);

const newTag = async (name: string, user: User): Promise<any> => {
    return new Promise((resolve, reject) => {
        Tag.count({ where: { user: user.id } })
            .then(tagct => {
                if (tagct <= keys.tagCeilings[user.tier]) {
                    const id = uuidv4();
                    QRCode.toDataURL(process.env.domain + "/tag/" + id, { errorCorrectionLevel: 'H' })
                        .then(qr => Tag.create(helpers.rmUndef({
                            id: id,
                            name: name,
                            user: user.id,
                            qrcode: qr
                        })))
                        .then(() => resolve(true))
                        .catch(reject);
                } else
                    reject('You have hit the tag limit for this tier, please consider upgrading');
            });
    });
}
const removal = async (id: string, uid: string): Promise<any> => {
    return new Promise((resolve, reject) => {
        Promise.allSettled([
            Comment.rmImageDelete(id),
            Tag.destroy({
                where: { id: id }
            })
        ]).then(() => resolve(true))
            .catch(reject);
    });
}


export { get, getall, newTag, removal };