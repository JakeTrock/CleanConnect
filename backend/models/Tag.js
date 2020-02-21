const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const TagSchema = new Schema({
    user: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        index: true
    },
    qrcode: {
        type: String,
        default: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAKQAAACkCAYAAAAZtYVBAAAACXBIWXMAAA7EAAAO6wGHNzZ2AAABzUlEQVR4nO3SMQEAIAzAMMC/5/HigB6Jgh7dMzMLIs7vAHgZkhRDkmJIUgxJiiFJMSQphiTFkKQYkhRDkmJIUgxJiiFJMSQphiTFkKQYkhRDkmJIUgxJiiFJMSQphiTFkKQYkhRDkmJIUgxJiiFJMSQphiTFkKQYkhRDkmJIUgxJiiFJMSQphiTFkKQYkhRDkmJIUgxJiiFJMSQphiTFkKQYkhRDkmJIUgxJiiFJMSQphiTFkKQYkhRDkmJIUgxJiiFJMSQphiTFkKQYkhRDkmJIUgxJiiFJMSQphiTFkKQYkhRDkmJIUgxJiiFJMSQphiTFkKQYkhRDkmJIUgxJiiFJMSQphiTFkKQYkhRDkmJIUgxJiiFJMSQphiTFkKQYkhRDkmJIUgxJiiFJMSQphiTFkKQYkhRDkmJIUgxJiiFJMSQphiTFkKQYkhRDkmJIUgxJiiFJMSQphiTFkKQYkhRDkmJIUgxJiiFJMSQphiTFkKQYkhRDkmJIUgxJiiFJMSQphiTFkKQYkhRDkmJIUgxJiiFJMSQphiTFkKQYkhRDkmJIUgxJiiFJMSQphiTFkKQYkhRDkmJIUgxJiiFJMSQphiTFkKQYkhRDknIBq5IFRPtkqyYAAAAASUVORK5CYII="
    },
    name: {
        type: String,
        required: true
    },
    comments: {
        type: Array
    },
    markedForDeletion: {
        type: Boolean,
        index: true,
        default: false
    },
    removedAt: {
        type: Date
    },
    dateLastAccessed: {
        type: Date,
        default: new Date()
    }
});

module.exports = mongoose.model('Tag', TagSchema);