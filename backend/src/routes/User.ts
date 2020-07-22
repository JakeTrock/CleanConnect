import {
    Request,
    Response,
    Router
} from "express";
import { ClientToken } from 'braintree';
import econf from '../config/express.conf';
import helpers from '../helpers';
import User from '../models/User';
import UserIndex from '../models/UserIndex';

import { ifUserDocument } from "../interfaces";
let router = Router();

// ROUTE: GET user/test
// DESCRIPTION: tests user route
// INPUT: none
router.get("/test", (req: Request, res: Response) => res.send("User Works"));

// ROUTE: POST user/register
// DESCRIPTION: sends registration email to user
// INPUT: user name, email and password(all as strings), via json body
router.post("/register", (req: Request, res: Response) => {
    User.new({
        name: req.body.name,
        email: req.body.email,
        password: req.body.password,
        password2: req.body.password2,
        payment_method_nonce: req.body.payment_method_nonce,
        phone: req.body.phone,
        tier: req.body.tier,
    }, econf.gateway)
        .then((user: ifUserDocument) =>
            UserIndex.createIndex({
                _id: user._id,
                email: user.email,
                prefix: "confirm",
                ic: true,
            }))
        .then(out => res.json(helpers.scadd(out)))
        .catch(e => res.json(helpers.erep(e)));
});
// ROUTE: GET user/resend
// DESCRIPTION: resends verification email to user
// INPUT: email as string via json body
router.post("/resend", (req: Request, res: Response) => {
    User.findOne({
        email: req.body.email,
    }).then((user: ifUserDocument | null) => {
        if (!user)
            res.json("Unable to find user with this email");
        else if (user.isVerified)
            res.json("This user is already verified");
        else {
            UserIndex.deleteOne({
                _userId: user._id
            }).then(() => UserIndex.createIndex({
                _id: user._id,
                email: user.email,
                prefix: "confirm",
                ic: true,
            }))
                .then(out => res.json(helpers.scadd(out)))
                .catch(e => res.json(helpers.erep(e)));
        }
    });
});
// ROUTE: GET user/confirm/:token
// DESCRIPTION: confirms that user exists, deletes verif token after it isn't necessary
// INPUT: token value via the url
router.get("/confirm/:token", (req: Request, res: Response) => {
    UserIndex.confirm(req.params.token)
        .then(() => res.json(helpers.blankres))
        .catch(e => res.json(helpers.erep(e)));
});
// ROUTE: POST user/login
// DESCRIPTION: generates token based on user properties submitted
// INPUT: user details via json user token
router.post("/login", (req: Request, res: Response) => {
    User.login(req.body.email, req.body.password)
        .then(out => res.json(helpers.scadd({
            token: out
        })))
        .catch(e => res.json(helpers.erep(e)));
});
// ROUTE: POST user/changeinfo
// DESCRIPTION: sends verification email to change account details
// INPUT: user id from jwt header
router.post("/changeinfo", helpers.passport, (req: Request, res: Response) => {
    UserIndex.createIndex({
        _id: req.user._id,
        email: req.user.email,
        prefix: "change",
        ic: false,
    })
        .then(out => res.json(helpers.scadd(out)))
        .catch(e => res.json(helpers.erep(e)));
});
// ROUTE: POST user/change/:token
// DESCRIPTION: recieves verification email to change account details
// INPUT: new user details via json body
router.post("/change/:token", helpers.passport, (req: Request, res: Response) => {
    UserIndex.confirm(req.params.token)
        .then((user: ifUserDocument) => User.changeInfo(user._id, req.body, econf.gateway))
        .then(() => res.json(helpers.blankres))
        .catch(e => res.json(helpers.erep(e)));
});
// ROUTE: POST user/resetPass
// DESCRIPTION: sends verification email to change account password
// INPUT: email
router.post("/resetPass", (req: Request, res: Response) => {
    UserIndex.createIndex({
        email: req.body.email,
        prefix: "resetPass",
        _id: undefined,
        ic: false
    })
        .then(out => res.json(helpers.scadd(out)))
        .catch(e => res.json(helpers.erep(e)));
});
// ROUTE: POST user/resetPass
// DESCRIPTION: recieves verification email to change password
// INPUT: email and new password twice
router.post("/resetPass/:token", (req: Request, res: Response) => {
    User.changePass(req.body)
        .then(() => res.json(helpers.blankres))
        .catch(e => res.json(helpers.erep(e)));
});
// ROUTE: DELETE user/deleteinfo
// DESCRIPTION: sends verification email to delete account
// INPUT: user details via json user token
router.delete("/deleteinfo", helpers.passport, (req: Request, res: Response) => {
    UserIndex.createIndex({
        _id: req.user._id,
        email: req.user.email,
        prefix: "delete",
        ic: false,
    })
        .then(out => res.json(helpers.scadd(out)))
        .catch(e => res.json(helpers.erep(e)));
});
// ROUTE: GET user/delete/:token
// DESCRIPTION: recieves deletion email link request
// INPUT: token value via url bar
router.get("/delete/:token", helpers.passport, (req: Request, res: Response) => {
    UserIndex.confirm(req.params.token)
        .then((user: ifUserDocument) => new Promise((resolve, reject) => {
            if (user._id.toString() != req.user._id.toString())
                reject({ ie: true, message: "email token does not match current user cookie, please log into this computer to load the cookie into your memory" });
            else resolve(user);
        })).then((user: ifUserDocument) => User.purge(user))
        .then(() => res.json(helpers.blankres))
        .catch((e: Error) => res.json(helpers.erep(e)));
});
// ROUTE: POST user/isValid/:token
// DESCRIPTION: checks if token is still valid
// INPUT: token value via url bar
router.get("/isValid/:token", (req: Request, res: Response) => {
    UserIndex.exists({
        token: req.params.token
    })
        .then((ex: boolean) => res.json({ success: ex }))
        .catch(e => res.json(helpers.erep(e)));
});
// ROUTE: GET user/current
// DESCRIPTION: returns current user
// INPUT: jwt token details
router.get("/current", helpers.passport, (req: Request, res: Response) => {
    User.get(req.user._id)
        .then((profile: ifUserDocument) =>
            res.json(helpers.scadd({
                isVerified: profile.isVerified,
                tier: profile.tier,
                _id: profile._id,
                dash: profile.dashUrl,
                dashCode: profile.dashCode,
                name: profile.name,
                email: profile.email,
            })))
        .catch((e: Error) => res.json(helpers.erep(e)));
});

// ROUTE: GET user/getClientToken
// DESCRIPTION: returns generic client token
// INPUT: none
router.get("/getClientToken", (req: Request, res: Response) => {
    econf.gateway.clientToken.generate({})
        .then((response: ClientToken) => res.json(helpers.scadd({
            clientToken: response.clientToken
        }))).catch(e => res.json(helpers.erep(e)));
});

// ROUTE: GET user/getAuthClientToken
// DESCRIPTION: returns user-custom client token
// INPUT: jwt token details
router.get("/getAuthClientToken", helpers.passport, (req: Request, res: Response) => {
    User.get(req.user._id)
        .then((usr: ifUserDocument) => econf.gateway.clientToken.generate({
            customerId: usr.custID,
        }))
        .then((response: ClientToken) => res.json(helpers.scadd({
            clientToken: response.clientToken
        })))
        .catch(e => res.json(helpers.erep(e)));
});
//exports current script as module
export default router;