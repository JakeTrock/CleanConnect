const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const uuidv1 = require('uuid/v1');

// Create Schema
const UserSchema = new Schema({
    internalId: {
        type: Schema.Types.ObjectId,
        ref: 'User',
    },
    externalId: {
        type: String,
        default: uuidv1().toString()
    },
    tags: [{
        type: String
    }],
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    date: {
        type: Date,
        default: Date.now
    },

});

module.exports = User = mongoose.model('User', UserSchema);