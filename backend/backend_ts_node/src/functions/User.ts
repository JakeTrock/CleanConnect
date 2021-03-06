import QRCode from 'qrcode';
import async from '../asyncpromise';
import bcrypt from 'bcryptjs';
import jwt from 'jwt-then';
import { ifUserDocument, UserChangeFields, UserNewInterface, PaymentReturnInterface, changePassInterface, custresInterface, subresInterface, qdashgenInterface, exterr, userCreationInfoInterface } from '../interfaces';
import { BraintreeGateway } from 'braintree';
import { Types } from 'mongoose';
import keys from '../config/keys.json';
import * as crypto from 'crypto';
import User from '../models/User';
import Inventory from '../models/Inventory';
import Tag from '../models/Tag';
import econf from '../config/express.conf';
import UserIndex from '../models/UserIndex';

export default {
    get: (id: string) => new Promise((resolve, reject) => {
        User.findById(id)
            .then((user: ifUserDocument | null) => {
                if (user) resolve(user);
                reject({ ie: true, message: "No such user exists!" });
            });
    }),
    removeItem: (user: Types.ObjectId, id: Types.ObjectId, op: string) => new Promise((resolve, reject) => {
        User.updateOne({
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
    }),
    login: (field1: string, field2: string) => new Promise((resolve, reject) => {
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
                    else reject({ ie: true, message: "Incorrect password" });
                });
            else reject({ ie: true, message: "User of this name/email cannot be found" });
        })
            .catch(reject);
    }),
    changeInfo: (usr: Types.ObjectId, changeFields: UserChangeFields, gateway: BraintreeGateway) => new Promise((resolve, reject) => {
        User.findById(usr)
            .then((user: ifUserDocument | null) => {
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
    }),
    changePass: (info: changePassInterface) => new Promise((resolve, reject) => {
        if (!info.password1 && !info.password2 && !(info.password1 === info.password2)) reject({ ie: true, message: "password error" });
        bcrypt.hash(info.password1, 10).then((hash: string) =>
            User.findOneAndUpdate({
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
    }),
    new: (details: UserNewInterface, gateway: BraintreeGateway) => new Promise((resolve, reject) => {
        if (details.payment_method_nonce && details.password === details.password2 && details.email.match(/^[^\s@]+@([^\s@.,]+\.)+[^\s@.,]{2,}$/) && details.name && details.phone.match(/^[\+]?[(]?[0-9]{3}[)]?[.]?[0-9]{3}[.]?[0-9]{4,6}$/)) {
            async.parallel({
                codes: (callback: (err: Error | null, res: qdashgenInterface | null) => void) => {
                    const dc = crypto.randomBytes(16).toString("hex").substring(8);
                    QRCode.toDataURL(process.env.domainPrefix + process.env.topLevelDomain + "/dash/" + dc)
                        .then((url: string) => {
                            callback(null, {
                                dashCode: dc,
                                dashUrl: url
                            });
                        }, err => callback(err, null))
                },
                password: (callback: (err: Error | null, res: string | null) => void) => {
                    bcrypt.hash(details.password, 10)
                        .then((pw: string) => {
                            details.password = pw;
                            callback(null, pw);
                        }, err => callback(err, null))
                },
                payment: (callback: (err: Error | exterr | null, res: PaymentReturnInterface | null) => void) => {
                    let tmp: PaymentReturnInterface = {
                        custID: undefined,
                        PayToken: undefined
                    };
                    gateway.customer.create({
                        email: details.email,
                        company: details.name,
                        phone: details.phone,
                        paymentMethodNonce: details.payment_method_nonce
                    })
                        .then((customerResult: custresInterface) => {
                            tmp.custID = customerResult.customer.id;
                            return gateway.subscription.create({
                                paymentMethodToken: customerResult.customer.paymentMethods[0].token,
                                planId: keys.tierID[details.tier]
                            });
                        })
                        .then((subscriptionResult: subresInterface) => {
                            tmp.PayToken = subscriptionResult.subscription.id;
                            callback(null, tmp);
                        }).catch(err => callback(err, null));
                }
            })
                .then((out: userCreationInfoInterface) => User.create({
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
                reject({ ie: true, message: "Passwords don't match" });
            else if (!details.payment_method_nonce)
                reject({ ie: true, message: "No payment information provided!" });
            else if (!details.email.match(/^[^\s@]+@([^\s@.,]+\.)+[^\s@.,]{2,}$/))
                reject({ ie: true, message: "Missing/bad email" });
            else if (!details.phone.match(/^[\+]?[(]?[0-9]{3}[)]?[.]?[0-9]{3}[.]?[0-9]{4,6}$/))
                reject({ ie: true, message: "Missing/bad phone number" });
            else reject({ ie: true, message: "Missing name" });
        }
    }),
    purge: (user: ifUserDocument) => new Promise((resolve, reject) => {
        async.parallel({
            delUser: (callback: (err?: Error) => void) => User.findByIdAndDelete(user._id)
                .then(() => callback())
                .catch(callback),
            payCancel: (callback: (err?: Error) => void) => econf.gateway.subscription.cancel(user.PayToken)
                .then(() => callback())
                .catch(callback),
            delIndexes: (callback: (err?: Error) => void) => UserIndex.deleteMany({
                userID: user._id,
            }).then(() => UserIndex.deleteMany({
                email: user.email,
            }))
                .then(() => callback())
                .catch(callback),
            delTags: (callback: (err?: Error) => void) => Tag.purge(user._id)
                .then(() => callback())
                .catch(callback),
            delInvs: (callback: (err?: Error) => void) => Inventory.purge(user._id)
                .then(() => callback())
                .catch(callback)
        }).then(() => resolve())
            .catch(reject);
    })
};