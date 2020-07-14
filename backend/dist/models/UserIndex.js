"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const UserIndexSchema = new mongoose_1.Schema({
    _userId: {
        type: mongoose_1.Types.ObjectId,
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
const UserIndex_1 = __importDefault(require("../functions/UserIndex"));
UserIndexSchema.statics = UserIndex_1.default;
exports.default = mongoose_1.model('UserIndex', UserIndexSchema);
