import { ClientToken } from 'braintree';
import helpers from '../helpers';
import User from '../models/User';
import UserIndex from '../models/UserIndex';
import gateway from '../config/payconf';
import { Callback } from 'aws-lambda';
import { reqBody } from '../interfaces';
// import { JWTuser } from "../interfaces";

const create = async (body: reqBody, callback: Callback): Promise<any> => {
    const { name, email, password, password2, payment_method_nonce, phone, tier } = body.data;
    User.newUsr({
        name: name,
        email: email,
        password: password,
        password2: password2,
        payment_method_nonce: payment_method_nonce,
        phone: phone,
        tier: tier
    }, gateway)
        .then((user: User) =>
            UserIndex.createIndex({
                id: user.id,
                email: user.email,
                prefix: "confirm",
                ic: true,
            }))
        .then(out => callback(null, helpers.scadd(out)))
        .catch(e => callback(null, helpers.erep(e)));
}
const resend = async (body: reqBody, callback: Callback): Promise<any> => {
    User.findOne({
        where: { email: body.data.email }
    }).then((user: User | null) => {
        if (!user)
            callback(null, "Unable to find user with this email");
        else if (user.isVerified)
            callback(null, "This user is already verified");
        else {
            UserIndex.destroy({
                where: { userID: user.id }
            }).then(() => UserIndex.createIndex({
                id: user.id,
                email: user.email,
                prefix: "confirm",
                ic: true,
            }))
                .then(out => callback(null, helpers.scadd(out)))
                .catch(e => callback(null, helpers.erep(e)));
        }
    });
}

const confirm = async (body: reqBody, callback: Callback): Promise<any> => {
    UserIndex.confirm(body.routing.token1)
        .then(() => callback(null, helpers.blankres))
        .catch(e => callback(null, helpers.erep(e)));
}

const login = async (body: reqBody, callback: Callback): Promise<any> => {
    User.login(body.data.email, body.data.password)
        .then(out => callback(null, helpers.scadd({
            token: out
        })))
        .catch(e => callback(null, helpers.erep(e)));
}

const changeReq = async (body: reqBody, callback: Callback): Promise<any> => {
    helpers.passport(body.routing.authorization)
        .then(usr => UserIndex.createIndex({
            id: usr.id,
            email: usr.email,
            prefix: "change",
            ic: false,
        }))
        .then(out => callback(null, helpers.scadd(out)))
        .catch(e => callback(null, helpers.erep(e)));
}

const change = async (body: reqBody, callback: Callback): Promise<any> => {
    UserIndex.confirm(body.routing.token1)
        .then((user: User) => User.changeInfo(user.id, body.data, gateway))
        .then(() => callback(null, helpers.blankres))
        .catch(e => callback(null, helpers.erep(e)));
}

const resetPassReq = async (body: reqBody, callback: Callback): Promise<any> => {
    UserIndex.createIndex({
        email: body.data.email,
        prefix: "resetPass",
        id: undefined,
        ic: false
    })
        .then(out => callback(null, helpers.scadd(out)))
        .catch(e => callback(null, helpers.erep(e)));
}

const resetPass = async (body: reqBody, callback: Callback): Promise<any> => {
    const { email, phone, password, password2 } = body.data;
    User.changePass({
        email: email,
        phone: phone,
        password: password,
        password2: password2
    })
        .then(() => callback(null, helpers.blankres))
        .catch(e => callback(null, helpers.erep(e)));
}

const removeReq = async (body: reqBody, callback: Callback): Promise<any> => {
    helpers.passport(body.routing.authorization)
        .then(usr => UserIndex.createIndex({
            id: usr.id,
            email: usr.email,
            prefix: "delete",
            ic: false,
        }))
        .then(out => callback(null, helpers.scadd(out)))
        .catch(e => callback(null, helpers.erep(e)));
}

const remove = async (body: reqBody, callback: Callback): Promise<any> => {
    Promise.allSettled([
        UserIndex.confirm(body.routing.token1),
        helpers.passport(body.routing.authorization)
    ])
        .then((doc: Array<any>) => new Promise((resolve, reject) => {//TODO:interface
            if (doc[0].id != doc[1].id)
                reject({ message: "email token does not match current user cookie, please log into this computer to load the cookie into your memory" });
            else resolve(doc[0]);
        }))
        .then((user: User) => User.purge(user))
        .then(() => callback(null, helpers.blankres))
        .catch((e: Error) => callback(null, helpers.erep(e)));
}

const isValid = async (body: reqBody, callback: Callback): Promise<any> => {
    UserIndex.count({
        where: { token: body.routing.token1 }
    })
        .then((ex: number) => callback(null, JSON.stringify({ success: ex != 0 })))
        .catch(e => callback(null, helpers.erep(e)));
}

const current = async (body: reqBody, callback: Callback): Promise<any> => {
    helpers.passport(body.routing.authorization)
        .then(usr => User.get(usr.id))
        .then((profile: User) =>
            callback(null, helpers.scadd({
                isVerified: profile.isVerified,
                tier: profile.tier,
                id: profile.id,
                dash: profile.dashUrl,
                dashCode: profile.dashCode,
                name: profile.name,
                email: profile.email,
            })))
        .catch((e: Error) => callback(null, helpers.erep(e)));
}

const getClientToken = async (body: reqBody, callback: Callback): Promise<any> => {
    gateway.clientToken.generate({})
        .then((response: ClientToken) => callback(null, helpers.scadd({
            clientToken: response.clientToken
        }))).catch(e => callback(null, helpers.erep(e)));
}

const getAuthClientToken = async (body: reqBody, callback: Callback): Promise<any> => {
    helpers.passport(body.routing.authorization)
        .then(usr => User.get(usr.id))
        .then((usr: User) => gateway.clientToken.generate({
            customerId: usr.custID,
        }))
        .then((response: ClientToken) => callback(null, helpers.scadd({
            clientToken: response.clientToken
        })))
        .catch(e => callback(null, helpers.erep(e)));
}

export { create, resend, confirm, login, changeReq, change, resetPassReq, resetPass, removeReq, remove, isValid, current, getClientToken, getAuthClientToken };