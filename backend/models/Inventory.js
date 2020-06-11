const mongoose = require('mongoose'),
    QRCode = require("qrcode"),
    Item = require("./Item"),
    User = require("./User.js"),
    async = require('promise-async'),
        helpers = require('../helpers'),
        Schema = mongoose.Schema;


const InventorySchema = new Schema({
    user: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        index: true
    },
    qrcode: {
        type: String,
        default: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAKQAAACkAQMAAAAjexcCAAAAA1BMVEX///+nxBvIAAAAGUlEQVRIx+3BAQEAAACCoP6vbojAAAAASDsOGAABLvCKGQAAAABJRU5ErkJggg=="
    },
    name: {
        type: String,
        required: [true, "No name provided"],
        unique: [true, "Name must be unique for this tag"], //isolate this to only user's tags?
    },
    status: {
        type: Number,
        default: 0,
        min: [0, "status cannot be lower than 0"],
        max: [2, "status cannot be higher than 2"]
    },
    items: [{
        type: Schema.Types.ObjectId,
        ref: 'Item'
    }],
}, {
    timestamps: true,
});
InventorySchema.methods = {
    addItem(item) {
        this.items.push(item);
    }
};
InventorySchema.statics = {
    get(id) {
        return new Promise((resolve, reject) => {
            this.findById(id)
                .then((inv) => {
                    if (inv) resolve(inv);
                    reject({
                        err: "No such inventory exists!"
                    });
                });
        });
    },
    getall(userID, sd) {
        return new Promise((resolve, reject) => {
            User.findById(userID)
                .populate({
                    path: 'invs',
                    populate: {
                        path: 'items',
                        model: 'Item',
                        match: {
                            markedForDeletion: sd
                        }
                    }
                })
                .then(user => resolve(user.invs))
                .catch(reject);
        });
    },
    new(name, user) {
        return new Promise((resolve, reject) => {
            const id = new mongoose.mongo.ObjectId();
            QRCode.toDataURL(process.env.domainPrefix + process.env.topLevelDomain + "/dash/inventory/" + id)
                .then(qr => this.create([{
                    _id: id,
                    name: name,
                    user: user._id,
                    qrcode: qr
                }], {
                    omitUndefined: true,
                    runValidators: true
                }))
                .then(newDoc => user.addInv(newDoc[0]))
                .then(() => user.save())
                .then(resolve())
                .catch(reject);
        });
    },
    update(id, updated) {
        return new Promise((resolve, reject) => {
            this.findOneAndUpdate({
                    _id: id
                }, updated, {
                    omitUndefined: true,
                    runValidators: true
                })
                .then(resolve())
                .catch(reject);
        });
    },
    remove(id, user) {
        return new Promise((resolve, reject) => {
            Item.deleteMany({
                    inventory: id
                })
                .then(this.deleteOne({
                    _id: id
                }))
                .then(User.removeInv(user._id, id))
                .then(resolve())
                .catch(reject);
        });
    },
    purge(userID) {
        return new Promise((resolve, reject) => {
            this.find({
                    user: userID
                }).then((inv) =>
                    async.forEachOf(Array.isArray(inv) ? inv : inv.split(), (value, key, callback) =>
                        Item.deleteMany({
                            inventory: value._id
                        })
                        .then(() => this.findByIdAndDelete(value._id))
                        .then(User.removeInv(userID, value._id))
                        .then(callback())
                        .catch(callback)
                    )
                )
                .then(resolve())
                .catch(reject);
        });
    }
};
InventorySchema.pre("save", function (next) {
    this.validate(function (err) {
        if (err)
            next(err);
        else
            next();
    });
});
module.exports = mongoose.model('Inventory', InventorySchema);