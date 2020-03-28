//import modules
const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const passport = require("passport");
const randomBytes = require("randombytes");
var shell = require('shelljs.exec');
var braintree = require("braintree");

//create derivative access vars
const router = express.Router();
// Load input validation
const validateRegisterInput = require("../validation/register");
const validateLoginInput = require("../validation/login");
//load keys
const keys = require("../config/keys");
//Load models
const User = require("../models/User");
const UserIndex = require("../models/UserIndex");
const Comment = require('../models/Comment.js');
const Tag = require('../models/Tag.js');
const erep = require("./erep.js");

//declare consts

var gateway = braintree.connect({
    environment: braintree.Environment.Sandbox,
    merchantId: keys.mid,
    publicKey: keys.pbk,
    privateKey: keys.prk
});

// ROUTE: GET user/test
// DESCRIPTION: tests user route
// INPUT: none
router.get("/test", (req, res) => res.send("User Works"));



function sendMail(body, link, sub, to, cb) { //TODO: add error catching to this func
    if (!process.env.testing) {
        var ml = shell(`
        (
            echo "To: ` + to + `"
            echo "Subject: ` + sub + `"
            echo "Content-Type: text/html"
            echo
            echo "<img src="data:image/png;base64,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"/>
            <p style="font-size:25px">
                <br /> ` + body + `
                <br />
            </p>
            <a href="` + link + `" style="font-size:25px">
                Proceed
            </a>
            <style>
            a {
                background-color: #4caf50;
                /* Green */
                border: none;
                color: white;
                padding: 15px 32px;
                text-align: center;
                text-decoration: none;
                display: inline-block;
                font-size: 16px;
                margin: 4px 2px;
                cursor: pointer;
            }
            .button2 {
                background-color: #008cba;
            }
            </style>"
            echo
            ) | /usr/sbin/sendmail -t
        `);
        if (ml.stderr != '') cb(ml.stderr);
    } else {
        console.log({
            from: "no-reply@" + process.env.topLevelDomain,
            to: to,
            subject: sub,
            text: body,
            link: link
        });
        cb();
    }
}

// ROUTE: POST user/register
// DESCRIPTION: sends registration email to user
// INPUT: user name, email and password(all as strings), via json body
router.post("/register", (req, res) => {
    const { errors, isValid } = validateRegisterInput(req.body);
    //check validation
    if (!isValid) return erep(res, errors, 400, "Invalid post body", "");

    User.findOne({
            email: req.body.email
        })
        .then(user => {
            if (user) {
                errors.email = "Email already exists";
                return erep(res, errors, 400, "Invalid post body", "");
            } else {
                gateway.customer.create({
                    paymentMethodNonce: req.body.payment_method_nonce
                }, function(err, result) {
                    if (result.success) {
                        var planID = keys.tierID[req.body.tier];
                        gateway.subscription.create({
                            paymentMethodToken: result.customer.paymentMethods[0].token,
                            planId: planID
                        }, function(err, result) {
                            if (result.success) {
                                const newUser = new User({
                                    name: req.body.name,
                                    email: req.body.email,
                                    dashUrl: randomBytes(16).toString("hex").substring(8),
                                    password: req.body.password,
                                    PayToken: result.subscription.id,
                                    tier: req.body.tier
                                });
                                bcrypt.genSalt(10, (err, salt) => {
                                    bcrypt.hash(newUser.password, salt, (err, hash) => {
                                        if (err) erep(res, err, 500, "Failed to generate password", req.body.email);
                                        newUser.password = hash;
                                        newUser.save(function(err) {
                                            if (err) return erep(res, err, 500, "Error saving user data", req.body.email);
                                            // Create a verification token for this user
                                            User.findOne({
                                                email: req.body.email
                                            }, "_id").exec(function(err, user) {
                                                if (err) return erep(res, err, 500, "Failed to find user", req.body.email);
                                                const vToken = new UserIndex({
                                                    _userId: user._id,
                                                    token: randomBytes(16).toString("hex"),
                                                    isCritical: true
                                                });
                                                vToken.save().then(p => {
                                                    // Send the email

                                                    sendMail("Hello " + user.name + ",Please verify your account by clicking the link:",
                                                        process.env.domainPrefix + process.env.topLevelDomain +
                                                        "/user/confirmation/" +
                                                        p.token, "CleanConnect Account Verification", req.body.email,
                                                        function(err) {
                                                            if (err) return erep(res, err, 500, "Failed to send mail", req.body.email);
                                                        });
                                                    res.json({
                                                        success: true,
                                                        status: "A verification email has been sent to " + req.body.email + "."
                                                    });
                                                });
                                            });
                                        });
                                    });
                                });
                            }
                        });
                    }
                });
            }
        }).catch(e => erep(res, e, 500, "Registration error", req.body.email));
});

// ROUTE: GET user/resend
// DESCRIPTION: resends verification email to user
// INPUT: email as string via json body
router.post("/resend", (req, res) => {
    // req.assert('email', 'Email is not valid').isEmail();
    // req.assert('email', 'Email cannot be blank').notEmpty();
    // req.sanitize('email').normalizeEmail({ remove_dots: false });

    // // Check for validation errors
    // var errors = req.validationErrors();
    // if (errors) return res.status(400).send(errors);

    User.findOne({ email: req.body.email }, function(err, user) {
        if (!user) return erep(res, err, 404, "Unable to find user with this email", user._id);
        if (user.isVerified) return erep(res, err, 400, "This user is already verified", user._id);
        const vToken = new UserIndex({
            _userId: user._id,
            token: randomBytes(16).toString("hex"),
            isCritical: true
        });
        vToken
            .save()
            .then(p => {
                // Send the email
                sendMail("Hello " + user.name + ",Please verify your account by clicking the link:",
                    process.env.domainPrefix + process.env.topLevelDomain +
                    "/user/confirmation/" +
                    p.token, "CleanConnect Account Verification", req.body.email,
                    function(err) {
                        if (err) return erep(res, err, 500, "Failed to send mail", user._id);
                    });
                res.json({
                    success: true,
                    status: "A verification email has been sent to " + req.body.email + "."
                });
            });
    });
});

// ROUTE: GET user/confirmation/:token
// DESCRIPTION: confirms that user exists, deletes verif token after it isn't necessary
// INPUT: token value via the url
router.get("/confirmation/:token", (req, res) => {
    // Find a matching token
    UserIndex.findOne({ token: req.params.token }, function(err, token) {
        if (!token) return erep(res, err, 400, "We were unable to find a valid token. Your token my have expired", "");
        // If we found a token, find a matching user
        User.findOne({ _id: token._userId }, function(err, user) {
            if (!user) return erep(res, err, 400, "We were unable to find a user with this token", token._userId);
            if (user.isVerified) erep(res, err, 400, "This user was already verified", token._userId);

            // Verify and save the user
            user.isVerified = true;
            user.save(function(err) {
                if (err) return erep(res, err, 404, "Error saving user", token._userId);
                token.deleteOne().then(() => res.json({
                    success: true
                })).catch(err => erep(res, err, 404, "Error deleting token", token._userId));
            });
        });
    });
});

// ROUTE: DELETE user/deleteinfo
// DESCRIPTION: sends verification email to delete account
// INPUT: user details via json user token
router.delete("/deleteinfo", passport.authenticate("jwt", {
    session: false
}), (req, res) => {
    const vToken = new UserIndex({
        _userId: req.user.id,
        token: randomBytes(16).toString("hex"),
        isCritical: false
    });
    vToken
        .save()
        .then(p => {
            // Send the email
            sendMail("Sorry to see you go, but if you must, click the link below to permanently delete your account:",
                process.env.domainPrefix + process.env.topLevelDomain +
                "/user/delete/" +
                p.token, "CleanConnect Account Deletion", req.body.email,
                function(err) {
                    if (err) return erep(res, err, 500, "Failed to send mail", req.user._id);
                });
            res.json({
                success: false,
                status: "A deletion email has been sent to " + req.user.email + "."
            });
        });
});

// ROUTE: GET user/delete/:token
// DESCRIPTION: recieves deletion email link request
// INPUT: token value via url bar
router.get("/delete/:token", passport.authenticate("jwt", {
    session: false
}), (req, res) => {
    UserIndex.findOne({ token: req.params.token }).then(tk => {
        if (tk._userId == req.user._id)
            Tag.findOne({
                _id: req.params.id
            }).then(udata => gateway.subscription.cancel(udata.PayToken))
            .then(User.findOneAndRemove({ _id: tk._userId }))
            .then(UserIndex.deleteMany({ _userId: tk._userId }))
            .then(Tag.find({
                user: req.user._id
            }).then(async posts => {
                if (posts) {
                    for (var n in posts) {
                        Comment.deleteMany({
                            tag: posts[n]._id
                        }).catch(err => erep(res, err, 404, "Error finding posts", req.user._id));
                    }
                }
            }))
            .then(Tag.deleteMany({ user: req.user._id }))
            .then(tk.deleteOne())
            .then(() => res.json({
                success: true
            }))
            .catch(e => erep(res, e, 500, "Deletion error", req.user._id));
        else erep(res, "", 403, "email token does not match current user cookie, please log into this computer to load the cookie into your memory", req.user._id);
    });
});

// ROUTE: POST user/changeinfo
// DESCRIPTION: sends verification email to change account details
// INPUT: user id from jwt header
router.post("/changeinfo", passport.authenticate("jwt", {
    session: false
}), (req, res) => {
    const vToken = new UserIndex({
        _userId: req.user.id,
        token: randomBytes(16).toString("hex"),
        isCritical: false
    });
    vToken
        .save()
        .then(p => {
            // Send the email
            sendMail("To proceed with altering details of your account, please click the link below:",
                process.env.domainPrefix + process.env.topLevelDomain +
                "/user/change/" +
                p.token, "CleanConnect Account Changes Confirmation", req.body.email,
                function(err) {
                    if (err) return erep(res, err, 500, "Failed to send mail", req.user._id);
                });
            res.json({
                success: true,
                status: "A settings email has been sent to " + req.user.email + "."
            });
        });
});

// ROUTE: POST user/change/:token
// DESCRIPTION: recieves verification email to change account details
// INPUT: new user details via json body
router.post(
    "/change/:token",
    passport.authenticate("jwt", {
        session: false
    }),
    (req, res) => {
        const profileFields = {};
        var planID;
        profileFields.user = req.user._id;
        if (req.body.tier) planID = keys.tierID[req.body.tier];
        if (req.body.name) profileFields.name = req.body.name;
        if (req.body.email) profileFields.email = req.body.email;
        if (req.body.password) profileFields.password = req.body.password;
        bcrypt.genSalt(10, (err, salt) => {
            bcrypt.hash(profileFields.password, salt, (err, hash) => {
                if (err) {
                    return res.json({
                        success: false,
                        simple: "Failed to generate password.",
                        details: err
                    })
                }
                profileFields.password = hash;
                UserIndex.findOne({ token: req.params.token }).then(tk => {
                    if (tk._userId == req.user.id) {
                        User.findOne({
                                _id: req.user.id
                            })
                            .then(profile => {
                                if (profile) {
                                    //update a profile
                                    User.findOneAndUpdate({
                                        _id: req.user.id
                                    }, {
                                        $set: profileFields
                                    }, {
                                        new: true
                                    }).then(res.json({
                                        success: true
                                    })).catch(e => res.json({
                                        success: false,
                                        simple: "Error updating profile.",
                                        details: e
                                    }));
                                    if (req.body.tier) {
                                        gateway.subscription.update(profile.PayToken, {
                                            planId: planID,
                                        }, function(err) {
                                            if (err) return erep(res, err, 404, "Failed to upgrade payment plan", req.user._id);
                                        });
                                    }
                                } else erep(res, "", 404, "Error finding profile", req.user._id);
                            })
                            .then(tk.deleteOne())
                            .catch(e => erep(res, e, 400, "Error processing token", req.user._id));
                    } else erep(res, "", 403, "email token does not match current user cookie, please log into this computer to load the cookie into your memory", req.user._id);
                });
            });
        });
    }
);

// ROUTE: POST user/isValid/:token
// DESCRIPTION: checks if token is still valid
// INPUT: token value via url bar
router.post(
    "/isValid/:token",
    passport.authenticate("jwt", {
        session: false
    }),
    (req, res) => {
        UserIndex.findOne({ token: req.params.token }).then(tk => {
            if (!tk) erep(res, "", 400, "Token does not exist, or is invalid", req.user._id);
            if (String(tk._userId) == String(req.user._id)) {
                User.findOne({
                        _id: req.user._id
                    })
                    .then(profile => {
                        if (!profile) erep(res, "", 404, "Error finding profile", req.user._id);
                        if (!profile.isVerified) return erep(res, "", 401, "Your account has not been verified yet", req.user._id);
                        res.status(200).json({
                            success: true
                        });
                    })
                    .catch(e => erep(res, e, 500, "Validation error", req.user._id));
            } else erep(res, "", 403, "email token does not match current user cookie, please log into this computer to load the cookie into your memory", req.user._id);
        });
    }
);

// ROUTE: POST user/login
// DESCRIPTION: generates token based on user properties submitted
// INPUT: user details via json user token

router.post("/login", (req, res) => {
    const password = req.body.password;

    //Find User by email
    const { errors, isValid } = validateLoginInput(req.body);
    //check validation
    if (!isValid) return erep(res, errors, 400, "Invalid login information", req.body.email);

    User.findOne({
            email: req.body.email
        })
        .then(user => {
            errors.email = "User not found.";
            // Check for user
            if (!user) return erep(res, errors, 400, "Invalid user information", req.body.email);
            if (!user.isVerified) {
                errors.verified = "User not verified.";
                return erep(res, errors, 400, "Verification error", user._id);
            }
            //Check password
            bcrypt.compare(password, user.password).then(isMatch => {
                if (isMatch) {
                    //User matched
                    const payload = {
                        tier: user.tier,
                        _id: user._id,
                        name: user.name,
                        dashUrl: user.dashUrl,
                        email: user.email,
                        date: user.date,
                    }; // create jwt payload
                    //Sign token
                    jwt.sign(
                        payload,
                        keys.secretOrKey, {
                            expiresIn: "1d"
                        },
                        (err, token) => {
                            if (err) erep(res, err, 500, "Unable to generate authentication", user._id);
                            else
                                res.json({
                                    success: true,
                                    token: "Bearer " + token
                                });
                        }
                    );
                } else {
                    errors.password = "Password Incorrect.";
                    return erep(res, errors, 400, "Invalid post body", user._id);
                }
            });
        })
        .catch(e => erep(res, e, 500, "Login error", req.body.email));
});

// ROUTE: GET user/current
// DESCRIPTION: returns current user
// INPUT: jwt token details
router.get('/current', passport.authenticate('jwt', {
    session: false
}), (req, res) => {
    User.findOne({
        _id: req.user._id,
        email: req.user.email
    }).then(profile => {
        if (!profile) erep(res, "", 404, "Error finding profile", req.user._id);
        res.json({
            isVerified: profile.isVerified,
            tier: profile.tier,
            _id: profile._id,
            name: profile.name,
            dashUrl: profile.dashUrl,
            email: profile.email,
            date: profile.date,
        });
    })
});
router.get('/getClientToken', (req, res) => {
    gateway.clientToken.generate({}, function(err, response) {
        res.send(response.clientToken);
    });
});
router.get('/getAuthClientToken', passport.authenticate('jwt', {
    session: false
}), (req, res) => {
    User.findOne({
        email: req.body.email
    }).then(usr => {
        gateway.clientToken.generate({
            customerId: usr.PayToken
        }, function(err, response) {
            res.send(response.clientToken);
        })
    });
});
//exports current script as module
module.exports = router;