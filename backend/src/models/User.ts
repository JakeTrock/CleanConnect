import { Schema, Types, model } from 'mongoose';
import * as crypto from 'crypto';
import { ifUserDocument, ifUserModel } from '../interfaces';
// import { NextFunction } from 'express';

// Create Schema
const UserSchema: Schema = new Schema({
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
      type: Types.ObjectId,
      ref: 'Tag'
    }]
  },
  invs: {
    type: [{
      type: Types.ObjectId,
      ref: 'Inventory'
    }]
  },
  isVerified: {
    type: Boolean,
    default: false,
  },
  tier: {
    type: Number,
    default: 0, //can be 0,1 or 2 for different tiers
    min: 0,
    max: 2,
  },
}, {
  timestamps: true,
});

import usrFunctions from '../functions/User';
UserSchema.statics = usrFunctions;

// UserSchema.pre("save", function (next: NextFunction) {
//   this.validate(function (err) {
//     if (err)
//       next(err);
//     else
//       next();
//   });
// });

export default model<ifUserDocument, ifUserModel>('User', UserSchema);