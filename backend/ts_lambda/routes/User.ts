import { ClientToken } from 'braintree';
import helpers from '../helpers';
import User from '../models/User';
import UserIndex from '../models/UserIndex';
import gateway from '../config/payconf';
import { APIGatewayEvent, Context, Callback } from 'aws-lambda';
// import { JWTuser } from "../interfaces";
// import async from '../asyncpromise';

const usrCreate = async (event: APIGatewayEvent, context: Context, callback: Callback): Promise<any> => {
    const { name, email, password, password2, payment_method_nonce, phone, tier } = JSON.parse(event.body);
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
const usrResend = async (event: APIGatewayEvent, context: Context, callback: Callback): Promise<any> => {
    User.findOne({
        where: { email: JSON.parse(event.body).email }
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

const usrConfirm = async (event: APIGatewayEvent, context: Context, callback: Callback): Promise<any> => {
    UserIndex.confirm(event.pathParameters.token)
        .then(() => callback(null, helpers.blankres))
        .catch(e => callback(null, helpers.erep(e)));
}

const usrLogin = async (event: APIGatewayEvent, context: Context, callback: Callback): Promise<any> => {
    User.login(JSON.parse(event.body).email, JSON.parse(event.body).password)
        .then(out => callback(null, helpers.scadd({
            token: out
        })))
        .catch(e => callback(null, helpers.erep(e)));
}

const usrChangeToken = async (event: APIGatewayEvent, context: Context, callback: Callback): Promise<any> => {
    helpers.passport(event)
        .then(usr => UserIndex.createIndex({
            id: usr.id,
            email: usr.email,
            prefix: "change",
            ic: false,
        }))
        .then(out => callback(null, helpers.scadd(out)))
        .catch(e => callback(null, helpers.erep(e)));
}

const usrChange = async (event: APIGatewayEvent, context: Context, callback: Callback): Promise<any> => {
    UserIndex.confirm(event.pathParameters.token)
        .then((user: User) => User.changeInfo(user.id, JSON.parse(event.body), gateway))
        .then(() => callback(null, helpers.blankres))
        .catch(e => callback(null, helpers.erep(e)));
}

const usrResetPassToken = async (event: APIGatewayEvent, context: Context, callback: Callback): Promise<any> => {
    UserIndex.createIndex({
        email: JSON.parse(event.body).email,
        prefix: "resetPass",
        id: undefined,
        ic: false
    })
        .then(out => callback(null, helpers.scadd(out)))
        .catch(e => callback(null, helpers.erep(e)));
}

const usrResetPass = async (event: APIGatewayEvent, context: Context, callback: Callback): Promise<any> => {
    User.changePass(JSON.parse(event.body))
        .then(() => callback(null, helpers.blankres))
        .catch(e => callback(null, helpers.erep(e)));
}

const usrDeleteToken = async (event: APIGatewayEvent, context: Context, callback: Callback): Promise<any> => {
    helpers.passport(event)
        .then(usr => UserIndex.createIndex({
            id: usr.id,
            email: usr.email,
            prefix: "delete",
            ic: false,
        }))
        .then(out => callback(null, helpers.scadd(out)))
        .catch(e => callback(null, helpers.erep(e)));
}

const usrDelete = async (event: APIGatewayEvent, context: Context, callback: Callback): Promise<any> => {
    Promise.allSettled([
        UserIndex.confirm(event.pathParameters.token),
        helpers.passport(event)
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

const usrIsValid = async (event: APIGatewayEvent, context: Context, callback: Callback): Promise<any> => {
    UserIndex.count({
        where: { token: event.pathParameters.token }
    })
        .then((ex: number) => callback(null, JSON.stringify({ success: ex != 0 })))
        .catch(e => callback(null, helpers.erep(e)));
}

const usrCurrent = async (event: APIGatewayEvent, context: Context, callback: Callback): Promise<any> => {
    helpers.passport(event)
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

const usrGetClientToken = async (event: APIGatewayEvent, context: Context, callback: Callback): Promise<any> => {
    gateway.clientToken.generate({})
        .then((response: ClientToken) => callback(null, helpers.scadd({
            clientToken: response.clientToken
        }))).catch(e => callback(null, helpers.erep(e)));
}

const usrGetAuthClientToken = async (event: APIGatewayEvent, context: Context, callback: Callback): Promise<any> => {
    helpers.passport(event)
        .then(usr => User.get(usr.id))
        .then((usr: User) => gateway.clientToken.generate({
            customerId: usr.custID,
        }))
        .then((response: ClientToken) => callback(null, helpers.scadd({
            clientToken: response.clientToken
        })))
        .catch(e => callback(null, helpers.erep(e)));
}

export { usrCreate, usrResend, usrConfirm, usrLogin, usrChangeToken, usrChange, usrResetPassToken, usrResetPass, usrDeleteToken, usrDelete, usrIsValid, usrCurrent, usrGetClientToken, usrGetAuthClientToken };