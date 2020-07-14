"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const braintree_1 = __importDefault(require("braintree"));
const helpers_1 = __importDefault(require("../helpers"));
const User_1 = __importDefault(require("../models/User"));
const UserIndex_1 = __importDefault(require("../models/UserIndex"));
const Inventory_1 = __importDefault(require("../models/Inventory"));
const Tag_1 = __importDefault(require("../models/Tag"));
const keys_json_1 = __importDefault(require("../config/keys.json"));
const asyncpromise_1 = __importDefault(require("../asyncpromise"));
let router = express_1.Router();
const gateway = braintree_1.default.connect({
    environment: braintree_1.default.Environment.Sandbox,
    merchantId: keys_json_1.default.mid,
    publicKey: keys_json_1.default.pbk,
    privateKey: keys_json_1.default.prk,
});
router.get("/test", (req, res) => res.send("User Works"));
router.post("/register", (req, res) => {
    User_1.default.new(req.body, gateway)
        .then((user) => UserIndex_1.default.createIndex({
        _id: user._id,
        email: user.email,
        prefix: "confirm",
        ic: true,
    }))
        .then(out => res.json(helpers_1.default.scadd(out)))
        .catch(e => res.json(helpers_1.default.erep(e)));
});
router.post("/resend", (req, res) => {
    User_1.default.findOne({
        email: req.body.email,
    }).then((user) => {
        if (!user)
            res.json("Unable to find user with this email");
        else if (user.isVerified)
            res.json("This user is already verified");
        else {
            UserIndex_1.default.deleteOne({
                _userId: user._id
            }).then(() => UserIndex_1.default.createIndex({
                _id: user._id,
                email: user.email,
                prefix: "confirm",
                ic: true,
            }))
                .then(out => res.json(helpers_1.default.scadd(out)))
                .catch(e => res.json(helpers_1.default.erep(e)));
        }
    });
});
router.get("/confirm/:token", (req, res) => {
    UserIndex_1.default.confirm(req.params.token)
        .then(() => res.json(helpers_1.default.blankres))
        .catch(e => res.json(helpers_1.default.erep(e)));
});
router.post("/login", (req, res) => {
    User_1.default.login(req.body.email, req.body.password)
        .then(out => res.json(helpers_1.default.scadd({
        token: out
    })))
        .catch(e => res.json(helpers_1.default.erep(e)));
});
router.post("/changeinfo", helpers_1.default.passport, (req, res) => {
    UserIndex_1.default.createIndex({
        _id: req.user._id,
        email: req.user.email,
        prefix: "change",
        ic: false,
    })
        .then(out => res.json(helpers_1.default.scadd(out)))
        .catch(e => res.json(helpers_1.default.erep(e)));
});
router.post("/change/:token", helpers_1.default.passport, (req, res) => {
    UserIndex_1.default.confirm(req.params.token)
        .then((user) => User_1.default.changeInfo(user._id, req.body, gateway))
        .then(() => res.json(helpers_1.default.blankres))
        .catch(e => res.json(helpers_1.default.erep(e)));
});
router.post("/resetPass", (req, res) => {
    UserIndex_1.default.createIndex({
        email: req.body.email,
        prefix: "resetPass",
        _id: undefined,
        ic: false
    })
        .then(out => res.json(helpers_1.default.scadd(out)))
        .catch(e => res.json(helpers_1.default.erep(e)));
});
router.post("/resetPass/:token", (req, res) => {
    User_1.default.changePass(req.body.email, req.body.password1, req.body.password2, req.body.phone)
        .then(() => res.json(helpers_1.default.blankres))
        .catch(e => res.json(helpers_1.default.erep(e)));
});
router.delete("/deleteinfo", helpers_1.default.passport, (req, res) => {
    UserIndex_1.default.createIndex({
        _id: req.user._id,
        email: req.user.email,
        prefix: "delete",
        ic: false,
    })
        .then(out => res.json(helpers_1.default.scadd(out)))
        .catch(e => res.json(helpers_1.default.erep(e)));
});
router.get("/delete/:token", helpers_1.default.passport, (req, res) => {
    UserIndex_1.default.confirm(req.params.token)
        .then((user) => {
        if (user._id.toString() != req.user._id.toString())
            res.json("email token does not match current user cookie, please log into this computer to load the cookie into your memory");
        else
            asyncpromise_1.default.parallel({
                delUser: (callback) => User_1.default.findByIdAndDelete(req.user._id).then(callback()).catch(callback),
                payCancel: (callback) => gateway.subscription.cancel(user.PayToken).then(callback()).catch(callback),
                delIndexes: (callback) => UserIndex_1.default.deleteMany({
                    _userId: user._id,
                }).then(() => UserIndex_1.default.deleteMany({
                    email: user.email,
                })).then(callback()).catch(callback),
                delTags: (callback) => Tag_1.default.purge(user._id).then(callback()).catch(callback),
                delInvs: (callback) => Inventory_1.default.purge(user._id).then(callback()).catch(callback)
            })
                .then(() => res.json(helpers_1.default.blankres))
                .catch(e => res.json(helpers_1.default.erep(e)));
    });
});
router.get("/isValid/:token", (req, res) => {
    UserIndex_1.default.exists({
        token: req.params.token
    })
        .then((ex) => res.json({ success: ex }))
        .catch(e => res.json(helpers_1.default.erep(e)));
});
router.get("/current", helpers_1.default.passport, (req, res) => {
    User_1.default.get(req.user._id)
        .then((profile) => res.json(helpers_1.default.scadd({
        isVerified: profile.isVerified,
        tier: profile.tier,
        _id: profile._id,
        dash: profile.dashUrl,
        dashCode: profile.dashCode,
        name: profile.name,
        email: profile.email,
    })))
        .catch(e => res.json(helpers_1.default.erep(e)));
});
router.get("/getClientToken", (req, res) => {
    gateway.clientToken.generate({})
        .then((response) => res.json(helpers_1.default.scadd({
        clientToken: response.clientToken
    }))).catch(e => res.json(helpers_1.default.erep(e)));
});
router.get("/getAuthClientToken", helpers_1.default.passport, (req, res) => {
    User_1.default.get(req.user._id)
        .then((usr) => gateway.clientToken.generate({
        customerId: usr.custID,
    }))
        .then((response) => res.json(helpers_1.default.scadd({
        clientToken: response.clientToken
    })))
        .catch(e => res.json(helpers_1.default.erep(e)));
});
exports.default = router;
