import { Schema, Types, model } from 'mongoose';
import { ifInventoryDocument, ifInventoryModel } from '../interfaces';
// import { NextFunction } from 'express';

const InventorySchema: Schema = new Schema({
    user: {
        type: Types.ObjectId,
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
        type: Types.ObjectId,
        ref: 'Item'
    }],
}, {
    timestamps: true,
});

import invFunctions from '../functions/Inventory';
InventorySchema.statics = invFunctions;

export default model<ifInventoryDocument, ifInventoryModel>('Inventory', InventorySchema);