"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const crypto = __importStar(require("crypto"));
const UserSchema = new mongoose_1.Schema({
    name: {
        type: String,
        required: [true, "No name provided"],
        unique: [true, "The name you provided was not unique"],
        minlength: [6, "name must be at least 6 characters"],
        maxlength: [100, "name must be less than 100 characters"]
    },
    email: {
        type: String,
        required: [true, "No email provided"],
        unique: [true, "The email you provided was not unique"],
        match: [
            /^[^\s@]+@([^\s@.,]+\.)+[^\s@.,]{2,}$/,
            "The email you provided was not correctly typed",
        ],
    },
    password: {
        type: String,
        required: [true, "No password provided"],
        minlength: [6, "Your password is too short, must be over 6 characters"],
    },
    dashUrl: {
        type: String,
        default: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAKQAAACkAQMAAAAjexcCAAAAA1BMVEX///+nxBvIAAAAGUlEQVRIx+3BAQEAAACCoP6vbojAAAAASDsOGAABLvCKGQAAAABJRU5ErkJggg==",
    },
    dashCode: {
        type: String,
        default: crypto.randomBytes(16).toString("hex").substring(8),
    },
    PayToken: {
        type: String,
        required: [true, "No payment customer token provided"],
    },
    custID: {
        type: String,
        required: [true, "No customer payment id provided"],
    },
    phone: {
        type: String,
        required: [true, "No phone provided"],
        match: [
            /^[\+]?[(]?[0-9]{3}[)]?[.]?[0-9]{3}[.]?[0-9]{4,6}$/,
            "The phone number you provided was not correctly typed",
        ],
        unique: [true, "The phone number you provided was not unique"],
    },
    tags: {
        type: [{
                type: mongoose_1.Types.ObjectId,
                ref: 'Tag'
            }]
    },
    invs: {
        type: [{
                type: mongoose_1.Types.ObjectId,
                ref: 'Inventory'
            }]
    },
    isVerified: {
        type: Boolean,
        default: false,
    },
    tier: {
        type: Number,
        default: 0,
        min: 0,
        max: 2,
    },
}, {
    timestamps: true,
});
const User_1 = __importDefault(require("../functions/User"));
UserSchema.statics = User_1.default;
UserSchema.pre("save", function (next) {
    this.validate(function (err) {
        if (err)
            next(err);
        else
            next();
    });
});
exports.default = mongoose_1.model('User', UserSchema);
