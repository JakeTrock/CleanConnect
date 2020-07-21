import { Schema, Types, model } from 'mongoose';
import { ifTagDocument, ifTagModel } from '../interfaces';
// import { NextFunction } from 'express';


const TagSchema: Schema = new Schema({
    user: {
        type: Types.ObjectId,
        ref: "User",
        index: true,
    },
    qrcode: {
        type: String,
        default: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAKQAAACkAQMAAAAjexcCAAAAA1BMVEX///+nxBvIAAAAGUlEQVRIx+3BAQEAAACCoP6vbojAAAAASDsOGAABLvCKGQAAAABJRU5ErkJggg==",
    },
    comments: [{
        type: Types.ObjectId,
        ref: 'Tag'
    }],
    name: {
        type: String,
        required: [true, "No name provided"],
        unique: [true, "Name must be unique for this tag"], //isolate this to only user's tags?
        minlength: [4, "name must be at least 4 characters"],
        maxlength: [100, "name must be less than 100 characters"]
    },
}, {
    timestamps: true
});

import tagFunctions from '../functions/Tag';
TagSchema.statics = tagFunctions;

// TagSchema.pre("save", function (next: NextFunction) {
//     this.validate(function (err) {
//         if (err)
//             next(err);
//         else
//             next();
//     });
// });
export default model<ifTagDocument, ifTagModel>('Tag', TagSchema);