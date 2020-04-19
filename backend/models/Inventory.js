const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const Inventory = new Schema({
    user: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        index: true
    },
    qrcode: {
        type: String,
        default: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAKQAAACkAQMAAAAjexcCAAAAA1BMVEX///+nxBvIAAAAGUlEQVRIx+3BAQEAAACCoP6vbojAAAAASDsOGAABLvCKGQAAAABJRU5ErkJggg=="
    },
    name: {
        type: String,
        required: true
    },
    status: {
        type: Number,
        default: 0
    },
    items: {
        type: Array
    },
    date: {
        type: Date,
        default: new Date()
    }
});

module.exports = mongoose.model('Inventory', Inventory);