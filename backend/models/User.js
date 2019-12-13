const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const uuidv1 = require('uuid/v1');

// Create Schema
const UserSchema = new Schema({
    internalId: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    },
    externalId: {
        type: String,
        default: uuidv1().toString()
    },
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        index:true
    },
    password: {
        type: String,
        required: true
    },
    date: {
        type: Date,
        default: Date.now
    },
    isVerified: {
        type: Boolean,
        default: false
    },
    tier: {
        type: Number,
        default: 0 //can be 0,1 or 2 for different tiers
    },
});

module.exports = User = mongoose.model('User', UserSchema);