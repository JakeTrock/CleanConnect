const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const PostSchema = new Schema({
    user: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        index:true
    },
    qrcode: {
        type: String
    },
    name: {
        type: String,
        required: true
    },
    comments: [{
        cid: {
            type: String,
            default:Math.random().toString(36).substring(7),
            index:true
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
        date: {
            type: Date,
            default: Date.now
        }
    }],
    dateLastAccessed: {
        type: Date,
        default: Date.now
    }
});

module.exports = Post = mongoose.model('Post', PostSchema);