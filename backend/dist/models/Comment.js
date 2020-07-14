"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const CommentSchema = new mongoose_1.Schema({
    tag: {
        type: mongoose_1.Types.ObjectId,
        ref: "Tag",
        index: true,
    },
    img: {
        type: String,
        data: Buffer,
    },
    text: {
        type: String,
        required: [true, "Please provide a short comment on the issue."],
        unique: [true, ""],
    },
    sev: {
        type: Number,
        required: [true, "Please rate the severity of the issue."],
        min: 0,
        max: 2
    },
    markedForDeletion: {
        type: Boolean,
        default: false,
    },
    removedAt: {
        type: Date,
    },
    deletedBy: {
        type: String,
    },
    ip: {
        type: String,
    },
}, {
    timestamps: true
});
const Comment_1 = __importDefault(require("../functions/Comment"));
CommentSchema.statics = Comment_1.default;
CommentSchema.pre("save", function (next) {
    this.validate(function (err) {
        if (err)
            throw err;
        if (err)
            next(err);
        else
            next();
    });
});
exports.default = mongoose_1.model('Comment', CommentSchema);
