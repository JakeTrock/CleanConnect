"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const TagSchema = new mongoose_1.Schema({
    user: {
        type: mongoose_1.Types.ObjectId,
        ref: "User",
        index: true,
    },
    qrcode: {
        type: String,
        default: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAKQAAACkAQMAAAAjexcCAAAAA1BMVEX///+nxBvIAAAAGUlEQVRIx+3BAQEAAACCoP6vbojAAAAASDsOGAABLvCKGQAAAABJRU5ErkJggg==",
    },
    comments: [{
            type: mongoose_1.Types.ObjectId,
            ref: 'Tag'
        }],
    name: {
        type: String,
        required: [true, "No name provided"],
        unique: [true, "Name must be unique for this tag"],
        minlength: [4, "name must be at least 4 characters"],
        maxlength: [100, "name must be less than 100 characters"]
    },
}, {
    timestamps: true
});
const Tag_1 = __importDefault(require("../functions/Tag"));
TagSchema.statics = Tag_1.default;
exports.default = mongoose_1.model('Tag', TagSchema);
