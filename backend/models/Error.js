const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const ErrorSchema = new Schema({
    err: {
        type: String
    }
}, {
    timestamps: true,
});

module.exports = mongoose.model('Error', ErrorSchema);