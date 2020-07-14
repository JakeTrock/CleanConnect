import {
    Request,
    Response,
    Router
} from "express";
import braintree, { ClientToken } from 'braintree';
import helpers from '../helpers';
import User from '../models/User';
import UserIndex from '../models/UserIndex';
import Inventory from '../models/Inventory';
import Tag from '../models/Tag';
import keys from '../config/keys.json';
import async from '../asyncpromise';
import { ifUserDocument } from "../interfaces";
let router = Router();
//Load models
const gateway = braintree.connect({
    environment: braintree.Environment.Sandbox,
    merchantId: keys.mid,
    publicKey: keys.pbk,
    privateKey: keys.prk,
});
// ROUTE: GET user/test
// DESCRIPTION: tests user route
// INPUT: none
router.get("/test", (req: Request, res: Response) => res.send("User Works"));

// ROUTE: POST user/register
// DESCRIPTION: sends registration email to user
// INPUT: user name, email and password(all as strings), via json body
router.post("/register", (req: Request, res: Response) => {
    User.new(req.body, gateway)
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
    }).then((user: ifUserDocument) => {
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
        .then((user: ifUserDocument) => User.changeInfo(user._id, req.body, gateway))
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
    User.changePass(
        req.body.email,
        req.body.password1,
        req.body.password2,
        req.body.phone
    )
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
        .then((user: ifUserDocument) => {
            if (user._id.toString() != req.user._id.toString())
                res.json("email token does not match current user cookie, please log into this computer to load the cookie into your memory");
            else
                async.parallel({
                    delUser: (callback) => User.findByIdAndDelete(req.user._id).then(callback()).catch(callback),
                    payCancel: (callback) => gateway.subscription.cancel(user.PayToken).then(callback()).catch(callback),
                    delIndexes: (callback) => UserIndex.deleteMany({
                        _userId: user._id,
                    }).then(() => UserIndex.deleteMany({
                        email: user.email,
                    })).then(callback()).catch(callback),
                    delTags: (callback) => Tag.purge(user._id).then(callback()).catch(callback),
                    delInvs: (callback) => Inventory.purge(user._id).then(callback()).catch(callback)
                })
                    .then(() => res.json(helpers.blankres))
                    .catch(e => res.json(helpers.erep(e)));
        });
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
        .catch(e => res.json(helpers.erep(e)));
});
router.get("/getClientToken", (req: Request, res: Response) => {
    gateway.clientToken.generate({})
        .then((response: ClientToken) => res.json(helpers.scadd({
            clientToken: response.clientToken
        }))).catch(e => res.json(helpers.erep(e)));
});
router.get("/getAuthClientToken", helpers.passport, (req: Request, res: Response) => {
    User.get(req.user._id)
        .then((usr: ifUserDocument) => gateway.clientToken.generate({
            customerId: usr.custID,
        }))
        .then((response: ClientToken) => res.json(helpers.scadd({
            clientToken: response.clientToken
        })))
        .catch(e => res.json(helpers.erep(e)));
});
//exports current script as module
export default router;