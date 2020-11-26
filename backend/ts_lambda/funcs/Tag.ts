import QRCode from 'qrcode';
import Comment from '../models/Comment';
import User from '../models/User';
import Tag from '../models/Tag';
import helpers from '../helpers';
import keys from '../config/keys';
import { v4 as uuidv4 } from 'uuid';

const get = async (id: string): Promise<any> => {
    return new Promise((resolve, reject) => {
        Tag.findOne({ where: { id: id } })
            .then((tag: Tag | null) => {
                if (tag) resolve(tag);
                reject({ message: "No such tag exists!" });
            });
    });
}
const getall = async (userID: string, sd: boolean): Promise<any> => {
    return new Promise((resolve, reject) => {
        User.findOne({ where: { id: userID } })
            .then(usr => {
                return usr.tags.map(e => e.comments.filter(a => a.markedForDeletion == sd))
            })
            .then(resolve)
            .catch(reject)
    });
}
const newTag = async (name: string, user: User): Promise<any> => {
    return new Promise((resolve, reject) => {
        Tag.count({ where: { user: user.id } })
            .then(tagct => {
                if (tagct <= keys.tagCeilings[user.tier]) {
                    const id = uuidv4();
                    QRCode.toDataURL(process.env.domainPrefix + process.env.topLevelDomain + "/tag/" + id, { errorCorrectionLevel: 'H' })
                        .then(qr => Tag.create(helpers.rmUndef({
                            id: id,
                            name: name,
                            user: user.id,
                            qrcode: qr
                        })))
                        .then(() => resolve())
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
        ]).then(() => resolve())
            .catch(reject);
    });
}
const purge = async (userID: string): Promise<any> => {
    return new Promise((resolve, reject) => {
        Tag.findAll({
            where: { user: userID }
        }).then(async (inv: Tag[]) =>{
            for await (const value of inv) {
                Promise.allSettled([
                    Comment.rmImageDelete(value.id),
                    Tag.findOne({
                        where: { id: value.id }
                    }).then(tag => tag.destroy())
                ])
            }
        })
            .then(() => resolve())
            .catch(reject);
    });
}

export { get, getall, newTag, removal, purge };