const mongoose = require("mongoose"),
  Schema = mongoose.Schema,
  jwt = require("jwt-then"),
  randomBytes = require("randombytes"),
  keys = require("../config/keys"),
  helpers = require('../helpers'),
  QRCode = require("qrcode"),
  async = require('promise-async'),
    bcrypt = require("bcryptjs");

// Create Schema
const UserSchema = new Schema({
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
    default: randomBytes(16).toString("hex").substring(8),
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
      type: Schema.Types.ObjectId,
      ref: 'Tag'
    }]
  },
  invs: {
    type: [{
      type: Schema.Types.ObjectId,
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

function genPass(password) {
  return new Promise((resolve, reject) => {
    bcrypt.hash(password, 10)
      .then(resolve)
      .catch(reject);
  });
}


UserSchema.methods = {
  addTag(tag) {
    this.tags.push(tag);
  },
  addInv(inv) {
    this.invs.push(inv);
  }
};

UserSchema.statics = {
  get(id) {
    return new Promise((resolve, reject) => {
      this.findById(id)
        .then((user) => {
          if (user) {
            resolve(user);
          }
          reject({
            err: "No such user exists!"
          });
        });
    });
  },
  removeTag(user, id) {
    return new Promise((resolve, reject) => {
      this.updateOne({
          _id: user
        }, {
          "$pull": {
            "tags": id
          }
        }, {
          runValidators: true
        })
        .then(resolve())
        .catch(reject);
    });
  },
  removeInv(user, id) {
    return new Promise((resolve, reject) => {
      this.updateOne({
          _id: user
        }, {
          "$pull": {
            "invs": id
          }
        }, {
          runValidators: true
        }).then(resolve())
        .catch(reject);
    });
  },
  login(field1, field2) {
    return new Promise((resolve, reject) => {
      this.find().or([{
          email: field1
        }, {
          name: field1
        }]).then(usr => {
          const user = usr[0];
          if (user)
            bcrypt.compare(field2, user.password).then((match) => {
              if (match)
                jwt.sign({
                  tier: user.tier,
                  _id: user._id,
                  name: user.name,
                  email: user.email,
                  dash: user.dashCode,
                }, keys.secretOrKey, {
                  expiresIn: "1d",
                }).then(tk => resolve(`Bearer ${tk}`));
              else reject({
                err: "Incorrect password"
              });
            });
          else reject({
            err: "User of this name/email cannot be found"
          });
        })
        .catch(reject);
    });
  },
  changeInfo(user, changeFields, gateway) {
    return new Promise((resolve, reject) => {
      this.findById(user._id)
        .then((user) => {
          if (changeFields.tier) {
            gateway.subscription.update(user.PayToken, {
                planId: keys.tierID[changeFields.tier],
              })
              .catch(reject);
          }
          if ("name", "email", "phone", "payNonce" in changeFields) {
            gateway.customer.update(user.custID, {
                company: changeFields.name,
                email: changeFields.email,
                phone: changeFields.phone,
                paymentMethodNonce: changeFields.payment_method_nonce
              }, {
                omitUndefined: true,
                runValidators: true
              })
              .catch(reject);
          }
          user.updateOne({
              name: changeFields.name,
              email: changeFields.email,
              phone: changeFields.phone,
              tier: changeFields.tier
            }, {
              omitUndefined: true,
              runValidators: true
            })
            .catch(reject);
        })
        .then(resolve())
        .catch(reject);
    });
  },
  changePass(email, password1, password2, phone) {
    return new Promise((resolve, reject) => {
      if (!password1 && !password2 && !password1 === password2) reject({
        err: "password error"
      });
      genPass(password1).then(hash =>
          this.findOneAndUpdate({
            email: email,
            phone: phone,
          }, {
            $set: {
              password: hash,
            },
          }, {
            new: true,
          }))
        .then(resolve())
        .catch(reject);
    });
  },
  new(details, gateway) {
    return new Promise((resolve, reject) => {
      let payTemp;
      if (details.password !== details.password2) reject({
        err: "Passwords don't match"
      });
      if (details.payment_method_nonce) {
        payTemp = details.payment_method_nonce;
      } else reject({
        err: "No payment information provided!"
      });
      async.parallel({
          codes: (callback) => {
            const dc = randomBytes(16).toString("hex").substring(8);
            QRCode.toDataURL(process.env.domainPrefix + process.env.topLevelDomain + "/dash/" + dc)
              .then(url => {
                callback(null, {
                  dashCode: dc,
                  dashUrl: url
                });
              }, err => callback(err, null))
          },
          password: (callback) => {
            genPass(details.password)
              .then(pw => {
                details.password = pw;
                callback(null, pw);
              }, err => callback(err, null))
          },
          payment: (callback) => {
            let tmp = {};
            gateway.customer.create({
                email: details.email,
                company: details.name,
                phone: details.phone,
                paymentMethodNonce: payTemp
              })
              .then(customerResult => {
                tmp.custID = customerResult.customer.id;
                return gateway.subscription.create({
                  paymentMethodToken: customerResult.customer.paymentMethods[0].token,
                  planId: keys.tierID[details.tier]
                });
              })
              .then(subscriptionResult => {
                tmp.PayToken = subscriptionResult.subscription.id;
                callback(null, tmp);
              }).catch(err => callback(err, null));
          }
        })
        .then(out => this.create({
          dashCode: out.codes.dashCode,
          dashUrl: out.codes.dashUrl,
          password: out.password,
          custID: out.payment.custID,
          PayToken: out.payment.PayToken,
          name: details.name,
          email: details.email,
          phone: details.phone,
          tier: details.tier
        }))
        .then(resolve)
        .catch(reject);
    });
  }
}

UserSchema.pre("save", function (next) {
  if (this.invs.length >= keys.invCeilings[this.tier] && this.tags.length >= keys.tagCeilings[this.tier])
    next(this.invs.length >= keys.invCeilings[this.tier] ? "You have hit the inventory limit for this tier, please consider upgrading" : "You have hit the tag limit for this tier, please consider upgrading");
  else this.validate(function (err) {
    if (err)
      next(err);
    else
      next();
  });
});
module.exports = mongoose.model("User", UserSchema);