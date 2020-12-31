import User from "../models/User";

const sharedGet = async (model: any, id: string): Promise<any> => {
    return new Promise((resolve, reject) => {
        model.findOne({
            where: {
                id: id
            }
        })
            .then((ob: any | null) => {
                if (ob)
                    resolve(ob);
                reject({
                    message: "No such object exists!"
                });
            });
    });
}

const sharedGetAll = async (mdl: string, userID: string, sd: boolean): Promise<any> => {
    return new Promise((resolve, reject) => {
        User.findOne({ where: { id: userID } })
            .then(usr => {
                return usr[mdl].map(e => e.comments.filter(a => a.markedForDeletion == sd))
            })
            .then(resolve)
            .catch(reject)
    });
}

export { sharedGet, sharedGetAll };