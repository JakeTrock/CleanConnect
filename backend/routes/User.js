//import modules
const express = require("express"),
    //create derivative access vars
    router = express.Router(),
    //Load models
    User = require("../models/User"),
    UserIndex = require("../models/UserIndex"),
    Inventory = require("../models/Inventory"),
    Tag = require("../models/Tag.js"),
    helpers = require('../helpers'),
    braintree = require("braintree"),
    keys = require('../config/keys'),
    async = require('promise-async'),
        gateway = braintree.connect({
            environment: braintree.Environment.Sandbox,
            merchantId: keys.mid,
            publicKey: keys.pbk,
            privateKey: keys.prk,
        });
// ROUTE: GET user/test
// DESCRIPTION: tests user route
// INPUT: none
router.get("/test", (req, res) => res.send("User Works"));
// ROUTE: POST user/register
// DESCRIPTION: sends registration email to user
// INPUT: user name, email and password(all as strings), via json body
router.post("/register", (req, res) => {
    User.new(req.body, gateway)
        .then(user =>
            UserIndex.createIndex({
                _id: user._id,
                email: user.email,
                prefix: "confirm",
                ic: true,
            })
        ).then(
            out => res.json(helpers.scadd(out)),
            e => res.json(helpers.erep(e))
        );
});
// ROUTE: GET user/resend
// DESCRIPTION: resends verification email to user
// INPUT: email as string via json body
router.post("/resend", (req, res) => {
    User.findOne({
        email: req.body.email,
    }).then(user => {
        if (!user)
            res.json({
                err: "Unable to find user with this email"
            });
        else if (user.isVerified)
            res.json({
                err: "This user is already verified"
            });
        else {
            return UserIndex.createIndex({
                    _id: user._id,
                    email: user.email,
                    prefix: "confirm",
                    ic: true,
                })
                .then(UserIndex.remove({
                    _id: user._id
                }))
                .then(
                    out => res.json(helpers.scadd(out)),
                    e => res.json(helpers.erep(e))
                );
        }
    });
});
// ROUTE: GET user/confirm/:token
// DESCRIPTION: confirms that user exists, deletes verif token after it isn't necessary
// INPUT: token value via the url
router.get("/confirm/:token", (req, res) => {
    UserIndex.confirm(req.params.token)
        .then(
            res.json(helpers.scadd()),
            e => res.json(helpers.erep(e))
        );
});
// ROUTE: POST user/login
// DESCRIPTION: generates token based on user properties submitted
// INPUT: user details via json user token
router.post("/login", (req, res) => {
    User.login(req.body.email, req.body.password)
        .then(
            out => res.json(helpers.scadd({
                token: out
            })),
            e => res.json(helpers.erep(e))
        );
});
// ROUTE: POST user/changeinfo
// DESCRIPTION: sends verification email to change account details
// INPUT: user id from jwt header
router.post("/changeinfo", helpers.passport, (req, res) => {
    UserIndex.createIndex({
        _id: req.user._id,
        email: req.user.email,
        prefix: "change",
        ic: false,
    }).then(
        out => res.json(helpers.scadd(out)),
        e => res.json(helpers.erep(e))
    );
});
// ROUTE: POST user/change/:token
// DESCRIPTION: recieves verification email to change account details
// INPUT: new user details via json body
router.post("/change/:token", helpers.passport, (req, res) => {
    UserIndex.confirm(req.params.token).then((user) => {
        User.changeInfo(user, req.body, gateway).then(
            res.json(helpers.scadd()),
            e => res.json(helpers.erep(e))
        );
    });
});
// ROUTE: POST user/resetPass
// DESCRIPTION: sends verification email to change account password
// INPUT: email
router.post("/resetPass", (req, res) => {
    UserIndex.createIndex({
        email: req.body.email,
        prefix: "resetPass", //templating of this name in an email dosen't look so good
        ic: false,
    }).then(
        out => res.json(helpers.scadd(out)),
        e => res.json(helpers.erep(e))
    );
});
// ROUTE: POST user/resetPass
// DESCRIPTION: recieves verification email to change password
// INPUT: email and new password twice
router.post("/resetPass/:token", (req, res) => {
    User.changePass(
        req.body.email,
        req.body.password1,
        req.body.password2,
        req.body.phone
    ).then(
        res.json(helpers.scadd()),
        e => res.json(helpers.erep(e))
    );
});
// ROUTE: DELETE user/deleteinfo
// DESCRIPTION: sends verification email to delete account
// INPUT: user details via json user token
router.delete("/deleteinfo", helpers.passport, (req, res) => {
    UserIndex.createIndex({
        _id: req.user._id,
        email: req.user.email,
        prefix: "delete",
        ic: false,
    }).then(
        out => res.json(helpers.scadd(out)),
        e => res.json(helpers.erep(e))
    );
});
// ROUTE: GET user/delete/:token
// DESCRIPTION: recieves deletion email link request
// INPUT: token value via url bar
router.get("/delete/:token", helpers.passport, (req, res) => {
    UserIndex.confirm(req.params.token)
        .then(user => {
            if (user._id.toString() != req.user._id.toString())
                res.json({
                    err: "email token does not match current user cookie, please log into this computer to load the cookie into your memory"
                });
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
                    .then(
                        res.json(helpers.scadd()),
                        e => res.json(helpers.erep(e))
                    );
        });
});
// ROUTE: POST user/isValid/:token
// DESCRIPTION: checks if token is still valid
// INPUT: token value via url bar
router.get("/isValid/:token", (req, res) => {
    UserIndex.exists({
        token: req.params.token
    }).then((ex) => {
        if (ex) res.json(helpers.scadd())
        else res.json({
            err: "token does not exist"
        })
    });
});
// ROUTE: GET user/current
// DESCRIPTION: returns current user
// INPUT: jwt token details
router.get("/current", helpers.passport, (req, res) => {
    User.get(req.user._id)
        .then(profile => {
                res.json(helpers.scadd({
                    isVerified: profile.isVerified,
                    tier: profile.tier,
                    _id: profile._id,
                    dash: profile.dashUrl,
                    dashCode: profile.dashCode,
                    name: profile.name,
                    email: profile.email,
                    date: profile.date,
                }));
            },
            e => res.json(helpers.erep(e)));
});
router.get("/getClientToken", (req, res) => {
    gateway.clientToken.generate({})
        .then(response => res.json(helpers.scadd({
            clientToken: response.clientToken
        }))).catch(e => res.json(helpers.erep(e)));
});
router.get("/getAuthClientToken", helpers.passport, (req, res) => {
    User.get(req.user._id)
        .then(usr => gateway.clientToken.generate({
            customerId: usr.custID,
        }))
        .then(response => res.json(helpers.scadd({
            clientToken: response.clientToken
        })))
        .catch(e => res.json(helpers.erep(e)));
});
//exports current script as module
module.exports = router;