const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const uuidv1 = require('uuid/v1');
const QRCode = require('qrcode');

const PostSchema = new Schema({
    user: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    },
    // tagid: {
    //     type: String,
    //     default: uuidv1().toString(),
    //     required: true,
    //     index: true
    // },
    // qrcode: {
    //     type: String,
    //     default:QRCode.toDataURL('http://' + 'localhost:3000' + '/tag/' + this._id)
    // },
    name: {
        type: String,
        required: true
    },
    comments: [{
        _id: {
            type: Schema.Types.ObjectId,
            ref: 'User'
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