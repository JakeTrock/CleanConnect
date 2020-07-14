import { Schema, Types, model } from 'mongoose';
import { ifUserIndexDocument, ifUserIndexModel } from '../interfaces';

const UserIndexSchema: Schema = new Schema({
    _userId: {
        type: Types.ObjectId,
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
    }
}, {
    timestamps: true
});

import uindFunctions from '../functions/UserIndex';
UserIndexSchema.statics = uindFunctions;

export default model<ifUserIndexDocument, ifUserIndexModel>('UserIndex', UserIndexSchema);