const mongoose = require('mongoose'),
    helpers = require('../helpers'),
    Schema = mongoose.Schema;

const ItemSchema = new Schema({
    inventory: {
        type: Schema.Types.ObjectId,
        ref: 'Inventory',
        index: true
    },
    name: {
        type: String,
        required: [true, "No name provided"],
        unique: [true, "Name must be unique for this item"]
    },
    maxQuant: {
        type: Number,
        min: [0, "Invalid Minimum"]
    },
    minQuant: {
        type: Number,
        default: 0,
        min: [0, "Invalid Minimum"]
    },
    curQuant: {
        type: Number,
        required: [true, "Current item quantity required"],
        min: [0, "Invalid Minimum"]
    },
    markedForDeletion: {
        type: Boolean,
        default: false
    },
    removedAt: {
        type: Date,
    },
    deletedBy: {
        type: String
    },
    ip: {
        type: String,
        // required: true //TODO:why won't this work?
    }
}, {
    timestamps: true,
});
ItemSchema.statics = {
    get(id) {
        return new Promise((resolve, reject) => {
            this.findById(id)
                .then((inv) => {
                    if (inv) resolve(inv);
                    reject({
                        err: "No such tag exists!"
                    });
                });
        });
    },
    new(inv, details) {
        return new Promise((resolve, reject) => {
            this.create([details], {
                    omitUndefined: true
                })
                .then(newDoc => inv.addItem(newDoc[0]))
                .then(() => inv.save())
                .then(resolve())
                .catch(reject);
        });
    },
    update(fp, updated, qupdate) {
        return new Promise((resolve, reject) => {
            if (qupdate) updated = {
                curQuant: updated.curQuant
            };
            this.findOneAndUpdate({
                    _id: fp
                }, updated, {
                    omitUndefined: true,
                    runValidators: true
                })
                .then(resolve())
                .catch(reject);
        });
    },
    mark(fp, status, ip) {
        return new Promise((resolve, reject) => {
            this.findOneAndUpdate(fp, {
                    $set: {
                        markedForDeletion: status,
                        removedAt: status ? new Date() : undefined,
                        deletedBy: ip ? ip : undefined,
                    },
                })
                .then(resolve())
                .catch(reject);
        });
    },
};
ItemSchema.pre("save", function (next) {
    this.validate(function (err) {
        if (err)
            next(err);
        else
            next();
    });
});
module.exports = mongoose.model('Item', ItemSchema);