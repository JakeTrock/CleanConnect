// import QRCode from 'qrcode';
var QRCode = require('qrcode');
import bcrypt from 'bcryptjs';
import jwt from 'jwt-then';
import { UserChangeFields, UserNewInterface, PaymentReturnInterface, changePassInterface, custresInterface, subresInterface } from '../interfaces';
import { BraintreeGateway } from 'braintree';
import keys from '../config/keys';
import * as crypto from 'crypto';
import Tag from '../models/Tag';
import UserIndex from '../models/UserIndex';
import User from '../models/User';
import gateway from '../config/payconf';
import Inventory from '../models/Inventory';


const get = async (id: string): Promise<any> => {
    return new Promise((resolve, reject) => {
        User.findOne({ where: { id: id } })
            .then((user: User | null) => {
                if (user) resolve(user);
                reject({ message: "No such user exists!" });
            });
    });
}
const login = async (field1: string, field2: string): Promise<any> => {
    return new Promise((resolve, reject) => {
        User.findOne({
            where: {
                $or: [{
                    email: {
                        $eq: field1
                    }
                },
                {
                    name: {
                        $eq: field1
                    }
                }
                ]
            }
        }).then((usr: User) => {
            if (usr)
                bcrypt.compare(field2, usr.password).then((match: boolean) => {
                    if (match)
                        jwt.sign({
                            tier: usr.tier,
                            id: usr.id,
                            name: usr.name,
                            email: usr.email,
                            dash: usr.dashCode,
                        }, keys.secretOrKey, {
                            expiresIn: "1d",
                        }).then((tk: String) => resolve(`Bearer ${tk}`));
                    else reject({ message: "Incorrect password" });
                });
            else reject({ message: "User of this name/email cannot be found" });
        })
            .catch(reject);
    });
}
const changeInfo = async (usr: string, changeFields: UserChangeFields, gateway: BraintreeGateway): Promise<any> => {
    return new Promise((resolve, reject) => {
        User.findOne({ where: { id: usr } })
            .then((user: User | null) => {
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
                user.update({
                    name: changeFields.name,
                    email: changeFields.email,
                    phone: changeFields.phone,
                    tier: changeFields.tier
                })
                    .catch(reject);
            })
            .then(() => resolve())
            .catch(reject);
    });
}
const changePass = async (info: changePassInterface): Promise<any> => {
    return new Promise((resolve, reject) => {
        if (!info.password && !info.password2 && !(info.password === info.password2)) reject({ message: "password error" });
        bcrypt.hash(info.password, 10).then((hash: string) =>
            User.findOne({
                where: {
                    email: info.email,
                    phone: info.phone
                }
            }).then(usr => usr.update({
                password: hash
            })))
            .then(() => resolve())
            .catch(reject);
    });
}
const newUsr = async (details: UserNewInterface, gateway: BraintreeGateway): Promise<any> => {
    return new Promise((resolve, reject) => {
        if (details.payment_method_nonce && details.password === details.password2 && details.email.match(/^[^\s@]+@([^\s@.,]+\.)+[^\s@.,]{2,}$/) && details.name && details.phone.match(/^[\+]?[(]?[0-9]{3}[)]?[.]?[0-9]{3}[.]?[0-9]{4,6}$/)) {
            Promise.allSettled([
                new Promise((resolve, reject) => {//TODO:convert these all and others to promise format
                    const dc = crypto.randomBytes(16).toString("hex").substring(8);
                    QRCode.toDataURL(process.env.domain + "/dash/" + dc)
                        .then((url: string) => {
                            resolve({
                                dashCode: dc,
                                dashUrl: url
                            });
                        }, err => reject(err))
                }),
                bcrypt.hash(details.password, 10),
                new Promise((resolve, reject) => {
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
                            resolve(tmp);
                        }).catch(err => reject(err));
                })
            ])
                .then((out: Array<any>) => User.create({//TODO:interface
                    dashCode: out[0].dashCode,
                    dashUrl: out[0].dashUrl,
                    password: out[1],
                    custID: out[2].custID,
                    PayToken: out[2].PayToken,
                    name: details.name,
                    email: details.email,
                    phone: details.phone,
                    tier: details.tier
                }))
                .catch(reject)
                .then(resolve);
        } else {
            if (details.password !== details.password2)
                reject({ message: "Passwords don't match" });
            else if (!details.payment_method_nonce)
                reject({ message: "No payment information provided!" });
            else if (!details.email.match(/^[^\s@]+@([^\s@.,]+\.)+[^\s@.,]{2,}$/))
                reject({ message: "Missing/bad email" });
            else if (!details.phone.match(/^[\+]?[(]?[0-9]{3}[)]?[.]?[0-9]{3}[.]?[0-9]{4,6}$/))
                reject({ message: "Missing/bad phone number" });
            else reject({ message: "Missing name" });
        }
    });
}
const purge = async (user: User): Promise<any> => {
    return new Promise((resolve, reject) => {
        Promise.allSettled([
            User.findOne({ where: { id: user.id } })
                .then(usr => usr.destroy()),
            gateway.subscription.cancel(user.PayToken),
            UserIndex.destroy({
                where: { userID: user.id }
            }).then(() => UserIndex.destroy({
                where: { email: user.email }
            })),
            Tag.purge(user.id),
            Inventory.purge(user.id)
        ]).then(() => resolve())
            .catch(reject);
    });
}
export { get, login, changeInfo, changePass, newUsr, purge };