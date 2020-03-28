const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Create Schema
const UserSchema = new Schema({
    name: {
        type: String,
        required: true
    },
    dashUrl: {
        type: String,
        required: true
    },
    PayToken: {
        type: String,
        required: true
    },
    custID: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        index: true
    },
    numTags: {
        type: Number,
        default: 0
    },
    password: {
        type: String,
        required: true
    },
    date: {
        type: Date,
        default: new Date()
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

module.exports = mongoose.model('User', UserSchema);