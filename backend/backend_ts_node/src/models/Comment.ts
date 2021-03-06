import { Schema, Types, model } from 'mongoose';
import { ifCommentDocument, ifCommentModel } from '../interfaces';
// import { NextFunction } from 'express';

const CommentSchema: Schema = new Schema({
  tag: {
    type: Types.ObjectId,
    ref: "Tag",
    index: true,
  },
  img: {
    type: String,
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
  ip: {
    type: String,
    required: true
  },
}, {
  timestamps: true
});

import cmtFunctions from '../functions/Comment';
CommentSchema.statics = cmtFunctions;

// CommentSchema.pre(['updateOne', 'findOneAndUpdate', 'save'], (next: NextFunction) => {
//   this.validate((err: Error) => {
//     if (err)
//       next(err);
//     else
//       next();
//   });
// });
export default model<ifCommentDocument, ifCommentModel>('Comment', CommentSchema);