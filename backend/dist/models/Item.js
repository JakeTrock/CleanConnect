"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const ItemSchema = new mongoose_1.Schema({
    inventory: {
        type: mongoose_1.Types.ObjectId,
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
        required: true
    }
}, {
    timestamps: true,
});
const Item_1 = __importDefault(require("../functions/Item"));
ItemSchema.statics = Item_1.default;
ItemSchema.pre("save", function (next) {
    this.validate(function (err) {
        if (err)
            next(err);
        else
            next();
    });
});
exports.default = mongoose_1.model('Item', ItemSchema);
