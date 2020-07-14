import econf from '../config/express.conf';
import cuss from 'cuss';
import async from '../asyncpromise';
import { ifCommentDocument, ifTagDocument, CommentInputData, CommentMarkFindParam } from '../interfaces';
import { Types } from 'mongoose';
import Comment from '../models/Comment';
import helpers from '../helpers';

export default {
    get: (id: string) => {
        return new Promise((resolve, reject) => {
            Comment.findById(id)
                .then((cmt: ifCommentDocument) => {
                    if (cmt)
                        resolve(cmt);
                    reject("No such comment exists!");
                });
        });
    },
    rmImageDelete: (id: Types.ObjectId) => {
        return new Promise((resolve, reject) => {
            Comment.find({
                tag: id
            }).then((cmt: Array<ifCommentDocument>) => async.forEachOf(cmt, (value: ifCommentDocument, key: Number, callback) => async.parallel({
                imageDeletion: (cb) => {
                    if (value.img) {
                        econf.gfs.delete(new helpers.toObjID(value.img))
                            .then(() => cb())
                            .catch((e) => cb(e))
                    }
                },
                commentDeletion: (cb) => {
                    value.deleteOne()
                        .then(cb())
                        .catch(e => cb(e));
                },
            }).catch(callback)))
                .then(() => resolve())
                .catch(reject);
        });
    },
    new: (details: CommentInputData, tag: ifTagDocument) => {
        return new Promise((resolve, reject) => {
            if (details.text.toLowerCase().split(" ").some((r) => cuss[r] == 2)) reject("You'll have to clean up your language before we clean up this room.");
            else {
                Comment.create(helpers.rmUndef(details))
                    .then((newDoc: ifCommentDocument) => tag.comments.push(newDoc._id))
                    .then(() => tag.save())
                    .then(() => resolve())
                    .catch(reject);
            }
        });
    },
    mark: (fp: CommentMarkFindParam, status: boolean, ip: string) => {
        return new Promise((resolve, reject) => {
            Comment.findOneAndUpdate(fp, {
                $set: {
                    markedForDeletion: status,
                    removedAt: status ? new Date() : undefined,
                    deletedBy: ip ? ip : undefined,
                },
            })
                .then(() => resolve())
                .catch(reject);
        });
    }
};