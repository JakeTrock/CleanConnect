const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const UserIndexSchema = new Schema({
    _userId: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    },
    email: {
        type: String
    },
    token: {
        type: String,
        required: true,
        index: true
    },
    isCritical: {
        type: Boolean,
        required: true
    },
    createdAt: {
        type: Date,
        required: true,
        default: new Date()
    }
});

module.exports = mongoose.model('UserIndex', UserIndexSchema);