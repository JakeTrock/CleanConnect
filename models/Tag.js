const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const uuidv1 = require('uuid/v1');

const PostSchema = new Schema({
    user: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    },
    tagid: {
        type: String,
        default: uuidv1().toString(),
        required: true
    },
    name: {
        type: String,
        required: true
    },
    comments: [{
        text: {
            type: String,
            required: true
        },
        date: {
            type: Date,
            default: Date.now
        }
    }]
});

module.exports = Post = mongoose.model('Post', PostSchema);