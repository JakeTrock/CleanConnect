import { Schema, Types, model } from 'mongoose';
import { ifCommentDocument, ifCommentModel } from '../interfaces';
import { NextFunction } from 'express';
const CommentSchema: Schema = new Schema({
  tag: {
    type: Types.ObjectId,
    ref: "Tag",
    index: true,
  },
  img: {
    type: String,
    data: Buffer,
  },
  text: {
    type: String,
    required: [true, "Please provide a short comment on the issue."],
    unique: [true, ""], //maybe remove it?
  },
  sev: {
    type: Number,
    required: [true, "Please rate the severity of the issue."],
    min: 0,
    max: 2
  },
  markedForDeletion: {
    type: Boolean,
    default: false,
  },
  removedAt: {
    type: Date,
  },
  deletedBy: {
    type: String,
  },
  ip: {
    type: String,
    // required: true //TODO:why won't this work?
  },
}, {
  timestamps: true
});

import cmtFunctions from '../functions/Comment';
CommentSchema.statics = cmtFunctions;

CommentSchema.pre("save", function (next: NextFunction) {
  this.validate(function (err) {
    if (err) throw err;
    if (err)
      next(err);
    else
      next();
  });
});
export default model<ifCommentDocument, ifCommentModel>('Comment', CommentSchema);