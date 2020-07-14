"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const InventorySchema = new mongoose_1.Schema({
    user: {
        type: mongoose_1.Types.ObjectId,
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
        unique: [true, "Name must be unique for this tag"],
    },
    status: {
        type: Number,
        default: 0,
        min: [0, "status cannot be lower than 0"],
        max: [2, "status cannot be higher than 2"]
    },
    items: [{
            type: mongoose_1.Types.ObjectId,
            ref: 'Item'
        }],
}, {
    timestamps: true,
});
const Inventory_1 = __importDefault(require("../functions/Inventory"));
InventorySchema.statics = Inventory_1.default;
InventorySchema.pre("save", function (next) {
    this.validate(function (err) {
        if (err)
            next(err);
        else
            next();
    });
});
exports.default = mongoose_1.model('Inventory', InventorySchema);
