const mongoose = require("mongoose"),
    Schema = mongoose.Schema,
    helpers = require('../helpers'),
    QRCode = require("qrcode"),
    User = require("./User.js"),
    async = require('promise-async'),
        Comment = require("./Comment.js");

const TagSchema = new Schema({
    user: {
        type: Schema.Types.ObjectId,
        ref: "User",
        index: true,
    },
    qrcode: {
        type: String,
        default: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAKQAAACkAQMAAAAjexcCAAAAA1BMVEX///+nxBvIAAAAGUlEQVRIx+3BAQEAAACCoP6vbojAAAAASDsOGAABLvCKGQAAAABJRU5ErkJggg==",
    },
    comments: [{
        type: Schema.Types.ObjectId,
        ref: 'Tag'
    }],
    name: {
        type: String,
        required: [true, "No name provided"],
        unique: [true, "Name must be unique for this tag"], //isolate this to only user's tags?
        minlength: [4, "name must be at least 4 characters"],
        maxlength: [100, "name must be less than 100 characters"]
    },
}, {
    timestamps: true
});
TagSchema.methods = {
    addComment(comment) {
        this.comments.push(comment);
    }
};
TagSchema.statics = {
    get(id) {
        return new Promise((resolve, reject) => {
            this.findById(id)
                .then((tag) => {
                    if (tag) resolve(tag);
                    reject({
                        err: "No such tag exists!"
                    });
                });
        });
    },
    getall(userID, sd) {
        return new Promise((resolve, reject) => {
            User.findById(userID)
                .populate({
                    path: 'tags',
                    populate: {
                        path: 'comments',
                        model: 'Comment',
                        match: {
                            markedForDeletion: sd
                        }
                    }
                })
                .then(user => resolve(user.tags))
                .catch(reject);
        });
    },
    new(name, user) {
        return new Promise((resolve, reject) => {
            const id = new mongoose.mongo.ObjectId();
            QRCode.toDataURL(process.env.domainPrefix + process.env.topLevelDomain + "/tag/" + id)
                .then(qr => this.create([{
                    _id: id,
                    name: name,
                    user: user._id,
                    qrcode: qr
                }], {
                    omitUndefined: true,
                    runValidators: true
                }))
                .then(newDoc => user.addTag(newDoc[0]))
                .then(() => user.save())
                .then(resolve())
                .catch(reject);
        });
    },
    update(id, updated) {
        return new Promise((resolve, reject) => {
            this.findByIdAndUpdate(id, {
                    name: updated.name
                }, {
                    runValidators: true
                })
                .then(resolve())
                .catch(reject);
        });
    },
    remove(id, user) {
        return new Promise((resolve, reject) => {
            Comment.rmImageDelete(id)
                .then(this.deleteOne({
                    _id: id
                }).exec())
                .then(User.removeTag(user._id, id))
                .then(resolve())
                .catch(reject);
        });
    },
    purge(userID) {
        return new Promise((resolve, reject) => {
            this.find({
                    user: userID
                }).then(inv =>
                    async.forEachOf(Array.isArray(inv) ? inv : inv.split(), (value, key, callback) => {
                        Comment.rmImageDelete(value._id)
                            .then(() => this.findByIdAndDelete(value._id))
                            .then(User.removeTag(userID, value._id))
                            .then(callback());
                    }))
                .then(resolve())
                .catch(reject);
        });
    }
};
TagSchema.pre("save", function (next) {
    this.validate(function (err) {
        if (err)
            next(err);
        else
            next();
    });
});
module.exports = mongoose.model("Tag", TagSchema);