const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const Item = new Schema({
    inventory: {
        type: Schema.Types.ObjectId,
        ref: 'Inventory',
        index: true
    },
    name: {
        type: String,
        required: true,
    },
    maxQuant: {
        type: Number
    },
    minQuant: {
        type: Number,
        required: true
    },
    curQuant: {
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
    deletedBy: {
        type: String
    },
    ip: {
        type: String,
        required: true
    },
    date: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Item', Item);