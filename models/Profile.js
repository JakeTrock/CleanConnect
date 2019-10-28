const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Create Schema

const ProfileSchema = new Schema({
    // In the profile schema we also need all the user
    // details hence we include the user shcema as an object where every 
    // user has an ID associated with it.
    user: {
        type: Schema.Types.ObjectId,
        ref: 'users',
    },
    handle: {
        type: String,
        required: true,
        max: 40
    },
    tags: [{
        type: String
    }],
    date: {
        type: Date,
        default: Date.now
    }
});

module.exports = Profile = mongoose.model('profile', ProfileSchema);