import helpers from '../helpers';
import Comment from '../models/Comment';

const get = async (id: string): Promise<any> => {
    return new Promise((resolve, reject) => {
        Comment.findOne({
            where: {
                id: id
            }
        })
            .then((cmt: Comment | null) => {
                if (cmt)
                    resolve(cmt);
                reject({
                    message: "No such comment exists!"
                });
            });
    });
}

const rmImageDelete = async (id: string): Promise<any> => {
    return new Promise((resolve, reject) => {
        Comment.findAll({
            where: {
                $or: [{
                    tag: {
                        $eq: id
                    }
                },
                {
                    id: {
                        $eq: id
                    }
                }
                ]
            }
        }).then(async (cmt: Array<Comment>) => {
            for await (const value of cmt) {
                Promise.allSettled([
                    new Promise((resolve, reject) => {
                        if (value.img)
                            helpers.deleteImage(value.img)
                                .then(() => resolve())
                                .catch((e: Error) => reject(e))
                    }),
                    Comment.destroy({
                        where: {
                            id: value.id
                        }
                    })
                ])
            }
        })
            .then(() => resolve())
            .catch(reject);
    });
}
const mark = async (id: string, tag: string, status: boolean, ip: string): Promise<any> => {
    return new Promise((resolve, reject) => {
        Comment.findOne({
            where: {
                tag: tag,
                id: id,
            },
        }).then(cmt => cmt.update({
            markedForDeletion: status,
            removedAt: status ? new Date() : undefined,
            ip: ip ? ip : undefined,
        }))
            .then(() => resolve())
            .catch(reject);
    })
}

export { get, rmImageDelete, mark };