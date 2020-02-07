const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const randomBytes = require("randombytes");

const CommentSchema = new Schema({
    tag: {
        type: Schema.Types.ObjectId,
        ref: 'Tag',
        index: true
    },
    cid: {
        type: String,
        default: randomBytes(16).toString("hex").substring(7),
        index: true
    },
    img: {
        type: String,
        data: Buffer
    },
    text: {
        type: String,
        required: true
    },
    sev: {
        type: Number,
        required: true
    },
    markedForDeletion: {
        type: Boolean
    },
    removedAt: {
        type: Date,
    },
    date: {
        type: Date,
        default: new Date()
    }
});

module.exports = Comment = mongoose.model('Comment', CommentSchema);