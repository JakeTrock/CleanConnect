import QRCode from 'qrcode';
import async from '../asyncpromise';
import bcrypt from 'bcryptjs';
import jwt from 'jwt-then';
import { ifUserDocument, UserChangeFields, UserNewInterface, PaymentReturnInterface } from '../interfaces';
import { BraintreeGateway } from 'braintree';
import { Types } from 'mongoose';
import keys from '../config/keys.json';
import * as crypto from 'crypto';
import User from '../models/User';

export default {
    get: (id: string) => {
        return new Promise((resolve, reject) => {
            User.findById(id)
                .then((user: ifUserDocument) => {
                    if (user) {
                        resolve(user);
                    }
                    reject("No such user exists!");
                });
        });
    },
    removeTag: (user: Types.ObjectId, id: Types.ObjectId) => {
        return new Promise((resolve, reject) => {
            User.updateOne({
                _id: user
            }, {
                "$pull": {
                    "tags": id
                }
            }, {
                runValidators: true
            })
                .then(() => resolve())
                .catch(reject);
        });
    },
    removeInv: (user: Types.ObjectId, id: Types.ObjectId) => {
        return new Promise((resolve, reject) => {
            User.updateOne({
                _id: user
            }, {
                "$pull": {
                    "invs": id
                }
            }, {
                runValidators: true
            }).then(() => resolve())
                .catch(reject);
        });
    },
    login: (field1: string, field2: string) => {
        return new Promise((resolve, reject) => {
            User.find().or([{
                email: field1
            }, {
                name: field1
            }]).then((user: ifUserDocument[]) => {
                const usr = user[0];
                if (usr)
                    bcrypt.compare(field2, usr.password).then((match: boolean) => {
                        if (match)
                            jwt.sign({
                                tier: usr.tier,
                                _id: usr._id,
                                name: usr.name,
                                email: usr.email,
                                dash: usr.dashCode,
                            }, keys.secretOrKey, {
                                expiresIn: "1d",
                            }).then((tk: String) => resolve(`Bearer ${tk}`));
                        else reject("Incorrect password");
                    });
                else reject("User of this name/email cannot be found");
            })
                .catch(reject);
        });
    },
    changeInfo: (usr: Types.ObjectId, changeFields: UserChangeFields, gateway: BraintreeGateway) => {
        return new Promise((resolve, reject) => {
            User.findById(usr)
                .then((user: ifUserDocument) => {
                    if (changeFields.tier) {
                        gateway.subscription.update(user.PayToken, {
                            planId: keys.tierID[changeFields.tier],
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
    changePass: (email: string, password1: string, password2: string, phone: string) => {
        return new Promise((resolve, reject) => {
            if (!password1 && !password2 && !(password1 === password2)) reject("password error");
            bcrypt.hash(password1, 10).then((hash: string) =>
                User.findOneAndUpdate({
                    email: email,
                    phone: phone,
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
    new: (details: UserNewInterface, gateway: BraintreeGateway) => {
        return new Promise((resolve, reject) => {
            if (details.payment_method_nonce && details.password === details.password2) {
                let payTemp = details.payment_method_nonce;
                async.parallel({
                    codes: (callback) => {
                        const dc = crypto.randomBytes(16).toString("hex").substring(8);
                        QRCode.toDataURL(process.env.domainPrefix + process.env.topLevelDomain + "/dash/" + dc)
                            .then((url: string) => {
                                callback(null, {
                                    dashCode: dc,
                                    dashUrl: url
                                });
                            }, err => callback(err, null))
                    },
                    password: (callback) => {
                        bcrypt.hash(details.password, 10)
                            .then((pw: string) => {
                                details.password = pw;
                                callback(null, pw);
                            }, err => callback(err, null))
                    },
                    payment: (callback) => {
                        let tmp: PaymentReturnInterface = {
                            custID: undefined,
                            PayToken: undefined
                        };
                        gateway.customer.create({
                            email: details.email,
                            company: details.name,
                            phone: details.phone,
                            paymentMethodNonce: payTemp
                        })
                            .then((customerResult: any) => {//TODO: typing troubles here, and below
                                tmp.custID = customerResult.customer.id;
                                return gateway.subscription.create({
                                    paymentMethodToken: customerResult.customer.paymentMethods[0].token,
                                    planId: keys.tierID[details.tier]
                                });
                            })
                            .then((subscriptionResult: any) => {//what type?
                                tmp.PayToken = subscriptionResult.subscription.id;
                                callback(null, tmp);
                            }).catch(err => callback(err, null));
                    }
                })
                    .then(out => User.create({
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
            } else {
                if (details.password !== details.password2)
                    reject("Passwords don't match");
                if (!details.payment_method_nonce)
                    reject("No payment information provided!");
            }
        });
    }
};