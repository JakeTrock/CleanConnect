const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const CommentSchema = new Schema({
    tag: {
        type: Schema.Types.ObjectId,
        ref: 'Tag',
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
        type: Boolean,
        default: false
    },
    removedAt: {
        type: Date,
    },
    ip: {
        type: String,
        required: true
    },
    date: {
        type: Date,
        default: new Date()
    }
});

module.exports = mongoose.model('Comment', CommentSchema);