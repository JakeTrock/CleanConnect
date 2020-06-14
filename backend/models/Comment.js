const mongoose = require("mongoose"),
  helpers = require('../helpers'),
  fs = require("fs"),
  cuss = require("cuss"),
  async = require('promise-async'),
    Schema = mongoose.Schema;

const CommentSchema = new Schema({
  tag: {
    type: Schema.Types.ObjectId,
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

CommentSchema.statics = {
  get(id) {
    return new Promise((resolve, reject) => {
      this.findById(id)
        .then(cmt => {
          if (cmt)
            resolve(cmt);
          reject({
            err: "No such comment exists!"
          });
        });
    });
  },
  rmImageDelete(id) {
    return new Promise((resolve, reject) => {
      this.find({
          tag: id
        }).then(cmt =>
          (cmt.length > 0) ? async.forEachOf(cmt, (value, key, callback) => async.parallel({
            imageDeletion: (cb) => {
              if (value.img)
                fs.unlinkSync(process.env.rootDir + "/temp/" + value.img)
                .catch(e => cb(e));
              cb();
            },
            commentDeletion: (cb) => {
              value.deleteOne()
                .then(cb())
                .catch(e => cb(e));
            },
          }).then(err => callback(err))): resolve()
        )
        .then(resolve())
        .catch(reject);
    });
  },
  new(details, tag) {
    return new Promise((resolve, reject) => {
      if (details.text.toLowerCase().split(" ").some((r) => cuss[r] == 2)) reject({
        err: "You'll have to clean up your language before we clean up this room."
      });
      else {
        this.create([details], {
            omitUndefined: true
          })
          .then(newDoc => tag.addComment(newDoc[0]))
          .then(() => tag.save())
          .then(resolve())
          .catch(reject);
      }
    });
  },
  mark(fp, status, ip) {
    return new Promise((resolve, reject) => {
      this.findOneAndUpdate(fp, {
          $set: {
            markedForDeletion: status,
            removedAt: status ? new Date() : undefined,
            deletedBy: ip ? ip : undefined,
          },
        })
        .then(resolve())
        .catch(reject);
    });
  }
};
CommentSchema.pre("save", function (next) {
  this.validate(function (err) {
    if (err) throw err;
    if (err)
      next(err);
    else
      next();
  });
});
module.exports = mongoose.model("Comment", CommentSchema);