import { Schema, Types, model } from 'mongoose';
import { ifItemDocument, ifItemModel } from '../interfaces';
import { NextFunction } from 'express';

const ItemSchema: Schema = new Schema({
    inventory: {
        type: Types.ObjectId,
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

import itmFunctions from '../functions/Item';
ItemSchema.statics = itmFunctions;

ItemSchema.pre("save", function (next: NextFunction) {
    this.validate(function (err) {
        if (err)
            next(err);
        else
            next();
    });
});
export default model<ifItemDocument, ifItemModel>('Item', ItemSchema);