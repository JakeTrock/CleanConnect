"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const express_conf_1 = __importDefault(require("../config/express.conf"));
const helpers_1 = __importDefault(require("../helpers"));
const User_1 = __importDefault(require("../models/User"));
const UserIndex_1 = __importDefault(require("../models/UserIndex"));
let router = express_1.Router();
router.get("/test", (req, res) => res.send("User Works"));
router.post("/register", (req, res) => {
    User_1.default.new({
        name: req.body.name,
        email: req.body.email,
        password: req.body.password,
        password2: req.body.password2,
        payment_method_nonce: req.body.payment_method_nonce,
        phone: req.body.phone,
        tier: req.body.tier,
    }, express_conf_1.default.gateway)
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
        .then((user) => User_1.default.changeInfo(user._id, req.body, express_conf_1.default.gateway))
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
    User_1.default.changePass(req.body)
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
        .then((user) => new Promise((resolve, reject) => {
        if (user._id.toString() != req.user._id.toString())
            reject({ ie: true, message: "email token does not match current user cookie, please log into this computer to load the cookie into your memory" });
        else
            resolve(user);
    })).then((user) => User_1.default.purge(user))
        .then(() => res.json(helpers_1.default.blankres))
        .catch((e) => res.json(helpers_1.default.erep(e)));
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
        .catch((e) => res.json(helpers_1.default.erep(e)));
});
router.get("/getClientToken", (req, res) => {
    express_conf_1.default.gateway.clientToken.generate({})
        .then((response) => res.json(helpers_1.default.scadd({
        clientToken: response.clientToken
    }))).catch(e => res.json(helpers_1.default.erep(e)));
});
router.get("/getAuthClientToken", helpers_1.default.passport, (req, res) => {
    User_1.default.get(req.user._id)
        .then((usr) => express_conf_1.default.gateway.clientToken.generate({
        customerId: usr.custID,
    }))
        .then((response) => res.json(helpers_1.default.scadd({
        clientToken: response.clientToken
    })))
        .catch(e => res.json(helpers_1.default.erep(e)));
});
exports.default = router;
