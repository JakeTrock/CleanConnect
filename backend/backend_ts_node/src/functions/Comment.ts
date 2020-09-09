import econf from '../config/express.conf';
import cuss from 'cuss';
import async from '../asyncpromise';
import { ifCommentDocument, ifTagDocument, CommentInputData, CommentMarkFindParam } from '../interfaces';
import { Types } from 'mongoose';
import Comment from '../models/Comment';
import helpers from '../helpers';
export default {
    get: (id: string) => new Promise((resolve, reject) => {
        Comment.findById(id)
            .then((cmt: ifCommentDocument | null) => {
                if (cmt)
                    resolve(cmt);
                reject({ ie: true, message: "No such comment exists!" });
            });
    }),
    rmImageDelete: (id: Types.ObjectId) => new Promise((resolve, reject) => {
        Comment.find().or([{
            tag: new helpers.toObjID(id)
        }, {
            _id: new helpers.toObjID(id)
        }])
            .then((cmt: Array<ifCommentDocument>) => async.forEachOf(cmt, (value: ifCommentDocument, key: Number, callback: (err?: Error) => void) => async.parallel({
                imageDeletion: (cb: (err?: Error) => void) => {
                    if (value.img)
                        econf.gfs.delete(new helpers.toObjID(value.img))
                            .then(() => cb())
                            .catch((e: Error) => cb(e))
                },
                commentDeletion: (cb: (err?: Error) => void) => {
                    value.deleteOne()
                        .then(() => cb())
                        .catch((e: Error) => cb(e));
                },
            })
                .then(() => callback())
                .catch(callback)
            ))
            .then(() => resolve())
            .catch(reject);
    }),
    new: (details: CommentInputData, tag: ifTagDocument) => new Promise((resolve, reject) => {
        if (details.text.toLowerCase().split(" ").some((r) => cuss[r] == 2)) reject({ ie: true, message: "You'll have to clean up your language before we clean up this room." });
        else {
            Comment.create(helpers.rmUndef(details))
                .then((newDoc: ifCommentDocument) => tag.comments.push(newDoc._id))
                .then(() => tag.save())
                .then(() => resolve())
                .catch(reject);
        }
    }),
    mark: (fp: CommentMarkFindParam, status: boolean, ip: string) => new Promise((resolve, reject) => {
        Comment.findOneAndUpdate(fp, {
            $set: {
                markedForDeletion: status,
                removedAt: status ? new Date() : undefined,
                ip: ip ? ip : undefined,
            },
        })
            .then(() => resolve())
            .catch(reject);
    })
};