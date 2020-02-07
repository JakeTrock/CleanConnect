const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const TagSchema = new Schema({
    user: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        index: true
    },
    qrcode: {
        type: String
    },
    name: {
        type: String,
        required: true
    },
    comments: {
        type: Array
    },
    markedForDeletion: {
        type: Boolean,
        index: true
    },
    removedAt: {
        type: Date
    },
    dateLastAccessed: {
        type: Date,
        default: new Date()
    }
});

module.exports = Tag = mongoose.model('Tag', TagSchema);