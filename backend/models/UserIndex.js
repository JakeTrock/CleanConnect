const mongoose = require('mongoose'),
    Schema = mongoose.Schema,
    randomBytes = require("randombytes"),
    helpers = require('../helpers'),
    async = require('promise-async'),
        User = require("./User.js");

const UserIndexSchema = new Schema({
    _userId: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    },
    email: {
        type: String
    },
    token: {
        type: String,
        required: true,
        index: true
    },
    isCritical: {
        type: Boolean,
        required: true
    }
}, {
    timestamps: true
});
UserIndexSchema.statics = {
    get(token) {
        return new Promise((resolve, reject) => {
            this.findOne({
                    token: token
                })
                .then((index) => {
                    if (index.token) resolve();
                    reject({
                        err: 'No user exists with this token'
                    });
                });
        });
    },
    createIndex(info) {
        return new Promise((resolve, reject) => {
            var data = {
                token: randomBytes(16).toString("hex"),
                isCritical: info.ic,
                email: info.email
            };
            if (info._id) data._userId = info._id;
            this.model('UserIndex').create(data)
                .then(doc => helpers.sendMail(info.prefix, doc.token, info.email))
                .then(resolve)
                .catch(reject);
        });
    },
    confirm(token) {
        return new Promise((resolve, reject) => {
            this.findOne({
                    token: token
                }).then(index => {
                    if (!index) reject({
                        err: "no token found"
                    });
                    else{
                        return index;
                    }
                })
                .then(index => async.parallel({
                    findUser: (callback) => {
                        User.findOne({
                                _id: index._userId
                            })
                            .then(usr => callback(null, usr))
                            .catch(err => callback(err, null));
                    },
                    delIndex: (callback) => {
                        index.deleteOne()
                            .then(out=>callback(null, out))
                            .catch(err => callback(err, null));
                    }
                })).then(user => {
                    if (user.delIndex.isCritical) {
                        user.findUser.updateOne({
                            $set: {
                                isVerified: true
                            }
                        }).then(resolve());
                    } else {
                        resolve(user.findUser);
                    }
                })
                .catch(reject);
        });
    },
    listPrunable(date) {
        return new Promise((resolve, reject) => {
            this.find({
                    isCritical: true,
                    createdAt: {
                        $lt: date
                    }
                })
                .then(resolve)
                .catch(reject);
        });
    }
};
module.exports = mongoose.model('UserIndex', UserIndexSchema);