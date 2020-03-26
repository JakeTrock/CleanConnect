const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const ErrorSchema = new Schema({
    ID: {
        type: String
    },
    message: {
        type: String
    },
    errorcode: {
        type: Number
    },
    err: {
        type: String
    },
    date: {
        type: Date,
        default: new Date()
    }
});

module.exports = mongoose.model('Error', ErrorSchema);