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
const qrcode_1 = __importDefault(require("qrcode"));
const asyncpromise_1 = __importDefault(require("../asyncpromise"));
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jwt_then_1 = __importDefault(require("jwt-then"));
const keys_json_1 = __importDefault(require("../config/keys.json"));
const crypto = __importStar(require("crypto"));
const User_1 = __importDefault(require("../models/User"));
exports.default = {
    get: (id) => {
        return new Promise((resolve, reject) => {
            User_1.default.findById(id)
                .then((user) => {
                if (user)
                    resolve(user);
                reject({ ie: true, message: "No such user exists!" });
            });
        });
    },
    removeItem: (user, id, op) => {
        return new Promise((resolve, reject) => {
            User_1.default.updateOne({
                _id: user
            }, {
                "$pull": {
                    op: id
                }
            }, {
                runValidators: true
            })
                .then(() => resolve())
                .catch(reject);
        });
    },
    login: (field1, field2) => {
        return new Promise((resolve, reject) => {
            User_1.default.find().or([{
                    email: field1
                }, {
                    name: field1
                }]).then((user) => {
                const usr = user[0];
                if (usr)
                    bcryptjs_1.default.compare(field2, usr.password).then((match) => {
                        if (match)
                            jwt_then_1.default.sign({
                                tier: usr.tier,
                                _id: usr._id,
                                name: usr.name,
                                email: usr.email,
                                dash: usr.dashCode,
                            }, keys_json_1.default.secretOrKey, {
                                expiresIn: "1d",
                            }).then((tk) => resolve(`Bearer ${tk}`));
                        else
                            reject({ ie: true, message: "Incorrect password" });
                    });
                else
                    reject({ ie: true, message: "User of this name/email cannot be found" });
            })
                .catch(reject);
        });
    },
    changeInfo: (usr, changeFields, gateway) => {
        return new Promise((resolve, reject) => {
            User_1.default.findById(usr)
                .then((user) => {
                if (changeFields.tier) {
                    gateway.subscription.update(user.PayToken, {
                        planId: keys_json_1.default.tierID[changeFields.tier],
                        paymentMethodToken: user.PayToken
                    }).catch(reject);
                }
                if (changeFields.hasOwnProperty("name") ||
                    changeFields.hasOwnProperty("email") ||
                    changeFields.hasOwnProperty("phone") ||
                    changeFields.hasOwnProperty("payNonce")) {
                    gateway.customer.update(user.custID, {
                        company: changeFields.name,
                        email: changeFields.email,
                        phone: changeFields.phone,
                        paymentMethodNonce: changeFields.payment_method_nonce
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
                .then(() => resolve())
                .catch(reject);
        });
    },
    changePass: (info) => {
        return new Promise((resolve, reject) => {
            if (!info.password1 && !info.password2 && !(info.password1 === info.password2))
                reject({ ie: true, message: "password error" });
            bcryptjs_1.default.hash(info.password1, 10).then((hash) => User_1.default.findOneAndUpdate({
                email: info.email,
                phone: info.phone,
            }, {
                $set: {
                    password: hash,
                },
            }, {
                new: true,
            }))
                .then(() => resolve())
                .catch(reject);
        });
    },
    new: (details, gateway) => {
        return new Promise((resolve, reject) => {
            if (details.payment_method_nonce && details.password === details.password2) {
                asyncpromise_1.default.parallel({
                    codes: (callback) => {
                        const dc = crypto.randomBytes(16).toString("hex").substring(8);
                        qrcode_1.default.toDataURL(process.env.domainPrefix + process.env.topLevelDomain + "/dash/" + dc)
                            .then((url) => {
                            callback(null, {
                                dashCode: dc,
                                dashUrl: url
                            });
                        }, err => callback(err, null));
                    },
                    password: (callback) => {
                        bcryptjs_1.default.hash(details.password, 10)
                            .then((pw) => {
                            details.password = pw;
                            callback(null, pw);
                        }, err => callback(err, null));
                    },
                    payment: (callback) => {
                        if (details.email.match(/^[^\s@]+@([^\s@.,]+\.)+[^\s@.,]{2,}$/) && details.name && details.phone.match(/^[\+]?[(]?[0-9]{3}[)]?[.]?[0-9]{3}[.]?[0-9]{4,6}$/)) {
                            let tmp = {
                                custID: undefined,
                                PayToken: undefined
                            };
                            gateway.customer.create({
                                email: details.email,
                                company: details.name,
                                phone: details.phone,
                                paymentMethodNonce: details.payment_method_nonce
                            })
                                .then((customerResult) => {
                                tmp.custID = customerResult.customer.id;
                                return gateway.subscription.create({
                                    paymentMethodToken: customerResult.customer.paymentMethods[0].token,
                                    planId: keys_json_1.default.tierID[details.tier]
                                });
                            })
                                .then((subscriptionResult) => {
                                tmp.PayToken = subscriptionResult.subscription.id;
                                callback(null, tmp);
                            }).catch(err => callback(err, null));
                        }
                        else {
                            if (!details.email.match(/^[^\s@]+@([^\s@.,]+\.)+[^\s@.,]{2,}$/))
                                callback({ ie: true, message: "Missing/bad email" }, null);
                            else if (!details.phone.match(/^[\+]?[(]?[0-9]{3}[)]?[.]?[0-9]{3}[.]?[0-9]{4,6}$/))
                                callback({ ie: true, message: "Missing/bad phone number" }, null);
                            else
                                callback({ ie: true, message: "Missing name" }, null);
                        }
                    }
                })
                    .then(out => User_1.default.create({
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
                    .catch(reject)
                    .then(resolve);
            }
            else {
                if (details.password !== details.password2)
                    reject({ ie: true, message: "Passwords don't match" });
                if (!details.payment_method_nonce)
                    reject({ ie: true, message: "No payment information provided!" });
            }
        });
    }
};
