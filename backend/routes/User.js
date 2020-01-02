//import modules
const fs = require('fs');
const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const passport = require("passport");
const nodemailer = require("nodemailer");
const randomBytes = require("randombytes");
//create express derivative access
const router = express.Router();
// Load input validation
const validateRegisterInput = require("../validation/register");
const validateLoginInput = require("../validation/login");
//load keys
const keys = require("../config/keys");
//Load user models
const User = require("../models/User");
const UserIndex = require("../models/UserIndex");

// ROUTE: GET user/test
// DESCRIPTION: tests user route
// INPUT: none
router.get("/test", (req, res) => res.send("Routes Works"));

//testing
const smtpTransport = nodemailer.createTransport({
    host: "smtp.ethereal.email",
    port: 587,
    auth: {
        user: "lilian.bernhard@ethereal.email",
        pass: "fCc7CKMVv1VvuvrsaR"
    }
});
smtpTransport.verify(function (error, success) {
    if (error) {
        console.log(error);
    } else {
        console.log("mailserver online.");
    }
});

//https://codemoto.io/coding/nodejs/email-verification-node-express-mongodb

//production
// const smtpTransport = nodemailer.createTransport({
//          name: 'localhost'
// })

// ROUTE: POST user/register
// DESCRIPTION: sends registration email to user
// INPUT: user name, email and password(all as strings), via json body
router.post("/register", (req, res) => {
    const { errors, isValid } = validateRegisterInput(req.body);
    //check validation
    if (!isValid) {
        return res.status(400).json(errors);
    }
    if (req.body.email == "fake@test.com") {//check for testing var
        const newUser = new User({
            name: req.body.name,
            email: req.body.email,
            password: req.body.password
        });

        bcrypt.genSalt(10, (err, salt) => {
            bcrypt.hash(newUser.password, salt, (err, hash) => {
                if (err) {
                    console.log(err);
                }
                newUser.password = hash;
                newUser.save(function (err) {
                    if (err) {
                        return res.status(500).json({
                            success: false,
                            reason: "Failed to save user.",
                            moreDetailed: err.message
                        });
                    }
                    // Create a verification token for this user
                    User.findOne(
                        {
                            email: req.body.email
                        },
                        "_id"
                    ).exec(function (err, user) {
                        if (err) {
                            return res.status(500).json({
                                success: false,
                                reason: "Failed to find user.",
                                moreDetailed: err.message
                            });
                        }
                        const vToken = new UserIndex({
                            _userId: user,
                            token: randomBytes(16).toString("hex"),
                            isCritical: true
                        });
                        vToken.save().then(p => res.json({ status: true, email: "/user/confirmation/" + p.token }));
                    });
                });
            });
        });
    }
    else {
        User.findOne({
            email: req.body.email
        })
            .then(user => {
                if (user) {
                    errors.email = "Email already exists";
                    return res.status(400).json(errors);
                } else {
                    const newUser = new User({
                        name: req.body.name,
                        email: req.body.email,
                        password: req.body.password
                    });
                    bcrypt.genSalt(10, (err, salt) => {
                        bcrypt.hash(newUser.password, salt, (err, hash) => {
                            if (err) {
                                console.log(err);
                            }
                            newUser.password = hash;
                            newUser.save(function (err) {
                                if (err) {
                                    return res.status(500).json({
                                        success: false,
                                        reason: "Failed to save user.",
                                        moreDetailed: err.message
                                    });
                                }
                                // Create a verification token for this user
                                User.findOne(
                                    {
                                        email: req.body.email
                                    },
                                    "_id"
                                ).exec(function (err, user) {
                                    if (err) {
                                        return res.status(500).json({
                                            success: false,
                                            reason: "Failed to find user.",
                                            moreDetailed: err.message
                                        });
                                    }
                                    const vToken = new UserIndex({
                                        _userId: user,
                                        token: randomBytes(16).toString("hex"),
                                        isCritical: true
                                    });
                                    vToken
                                        .save()
                                        .then(p => {
                                            // Send the email
                                            var mailOptions = {
                                                from:
                                                    "no-reply@" + req.headers.host,
                                                to: req.body.email,
                                                subject:
                                                    "Account Verification Token",
                                                text:
                                                    "Hello,\n\n" +
                                                    "Please verify your account by clicking the link: \n" +
                                                    prefix +
                                                    req.headers.host +
                                                    "/user/confirmation/" +
                                                    p.token +
                                                    ".\n"
                                            };
                                            console.log(
                                                req.headers.host +
                                                "/user/confirmation/" +
                                                p.token +
                                                ".\n"
                                            );
                                            smtpTransport.sendMail(
                                                mailOptions,
                                                function (err) {
                                                    if (err) {
                                                        return res
                                                            .status(500)
                                                            .json({
                                                                success: false,
                                                                reason:
                                                                    "Failed to send mail.",
                                                                moreDetailed:
                                                                    err.message
                                                            });
                                                    }
                                                }
                                            );
                                        })
                                        .then(
                                            res.json({
                                                status:
                                                    "A verification email has been sent to " +
                                                    req.body.email +
                                                    "."
                                            })
                                        )
                                        .catch(err => console.log(err));
                                });
                            });
                        });
                    });
                }
            })
            .catch(e => console.error(e));
    }
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

    User.findOne({ email: req.body.email }, function (err, user) {
        if (!user)
            return res.status(404).send({
                msg: "We were unable to find a user with that email."
            });
        if (user.isVerified) {
            return res.status(400).send({
                msg: "User is already verified"
            });
        }
        const vToken = new UserIndex({
            _userId: user._id,
            token: randomBytes(16).toString("hex"),
            isCritical: true
        });
        vToken
            .save()
            .then(p => {
                // Send the email
                var mailOptions = {
                    from: "no-reply@" + req.headers.host,
                    to: req.body.email,
                    subject: "Account Verification Token",
                    text:
                        "Hello,\n\n" +
                        "Please verify your account by clicking the link: \n" +
                        prefix +
                        req.headers.host +
                        "/user/confirmation/" +
                        p.token +
                        ".\n"
                };
                console.log(
                    req.headers.host + "/user/confirmation/" + p.token + "\n"
                );
                smtpTransport.sendMail(mailOptions, function (err) {
                    if (err) {
                        return res.status(500).json({
                            success: false,
                            reason: "Failed to send mail.",
                            moreDetailed: err.message
                        });
                    }
                });
            })
            .then(
                res.json({
                    status:
                        "A verification email has been sent to " +
                        req.body.email +
                        "."
                })
            )
            .catch(err => console.log(err));
    });
});

// ROUTE: GET user/confirmation/:token
// DESCRIPTION: confirms that user exists, deletes verif token after it isn't necessary
// INPUT: token value via the url
router.get("/confirmation/:token", (req, res) => {
    // Find a matching token
    UserIndex.findOne({ token: req.params.token }, function (err, token) {
        console.log(token);
        if (!token)
            return res.status(400).send({
                type: "not-verified",
                msg: "We were unable to find a valid token. Your token my have expired."
            });
        // If we found a token, find a matching user
        User.findOne({ _id: token._userId }, function (err, user) {
            console.log(user);
            if (!user)
                return res.status(400).send({
                    msg: "We were unable to find a user for this token."
                });
            if (user.isVerified) {
                return res.status(400).send({
                    msg: "User is already verified"
                });
            }

            // Verify and save the user
            user.isVerified = true;
            user.save(function (err) {
                if (err) {
                    return res.status(500).send({ msg: err.message });
                }
                res.json({ "status": "success" });
            });
        });
    });
});

// ROUTE: DELETE user/deleteinfo
// DESCRIPTION: sends verification email to delete account
// INPUT: user details via json user token
router.delete("/deleteinfo", passport.authenticate("jwt", {
    session: false
}),
    (req, res) => {
        const vToken = new UserIndex({
            _userId: req.user.id,
            token: randomBytes(16).toString("hex"),
            isCritical: false
        });
        vToken
            .save()
            .then(p => {
                // Send the email
                var mailOptions = {
                    from: "no-reply@" + req.headers.host,
                    to: req.user.email,
                    subject: "Account Deletion",
                    text:
                        "Hello,\n\n" +
                        "Please delete your account by clicking the link: \n" +
                        prefix +
                        req.headers.host +
                        "/delete/" +
                        p.token +
                        ".\n"
                };
                smtpTransport.sendMail(mailOptions, function (err) {
                    if (err) {
                        return res.status(500).json({
                            success: false,
                            reason: "Failed to send mail.",
                            moreDetailed: err.message
                        });
                    }
                });
            })
            .then(
                res.json({
                    status:
                        "A deletion email has been sent to " +
                        req.user.email +
                        "."
                })
            )
            .catch(err => console.log(err));
    }
);

// ROUTE: GET user/delete/:token
// DESCRIPTION: recieves deletion email link request
// INPUT: token value via url bar
router.get(
    "/delete/:token",
    passport.authenticate("jwt", {
        session: false
    }),
    (req, res) => {
        UserIndex.findOne({ token: req.params.token }).then(tk => {
            if (tk._userId == req.user._id)
                User.findOneAndRemove({ _id: tk._userId })
                    .then(UserIndex.findOneAndRemove({ _userId: tk._userId }))
                    .then(() => res.json({ success: true }))
                    .catch(e => console.error(e));
            else
                res.status(403).json({
                    success: false,
                    reason:
                        "email token does not match current user cookie, please log into this computer to load the cookie into your memory"
                });
        });
    }
);

// ROUTE: POST user/changeinfo
// DESCRIPTION: sends verification email to change account details
// INPUT: user id from jwt header
router.post(
    "/changeinfo",
    passport.authenticate("jwt", {
        session: false
    }),
    (req, res) => {
        const vToken = new UserIndex({
            _userId: req.user.id,
            token: randomBytes(16).toString("hex"),
            isCritical: false
        });
        vToken
            .save()
            .then(p => {
                // Send the email
                var mailOptions = {
                    from: "no-reply@" + req.headers.host,
                    to: req.user.email,
                    subject: "Account Changes",
                    text:
                        "Hello,\n\n" +
                        "Please alter your account by clicking the link: \n" +
                        prefix +
                        req.headers.host +
                        "/change/" +
                        p.token +
                        ".\n"
                };
                smtpTransport.sendMail(mailOptions, function (err) {
                    if (err) {
                        return res.status(500).json({
                            success: false,
                            reason: "Failed to send mail.",
                            moreDetailed: err.message
                        });
                    }
                });
            })
            .then(
                res.json({
                    status:
                        "A settings email has been sent to " +
                        req.user.email +
                        "."
                })
            )
            .catch(err => console.log(err));
    }
);

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
        profileFields.user = req.user._id;
        if (req.body.name) profileFields.name = req.body.name;
        if (req.body.email) profileFields.email = req.body.email;
        if (req.body.password) profileFields.password = req.body.password;
        bcrypt.genSalt(10, (err, salt) => {
            bcrypt.hash(profileFields.password, salt, (err, hash) => {
                if (err) {
                    console.log(err);
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
                                    Profile.findOneAndUpdate(
                                        {
                                            _id: req.user.id
                                        },
                                        {
                                            $set: profileFields
                                        },
                                        {
                                            new: true
                                        }
                                    )
                                        .then(res.json({ status: "success" }))
                                        .catch(e => console.error(e));
                                } else {
                                    res.status(404).json({
                                        success: false,
                                        reason: "Profile does not exist."
                                    });
                                }
                            })
                            .then(
                                UserIndex.findOneAndRemove({
                                    _userId: tk._userId
                                })
                            )
                            .catch(e => console.error(e));
                    } else
                        res.status(403).json({
                            success: false,
                            reason:
                                "email token does not match current user cookie, please log into this computer to load the cookie into your memory"
                        });
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
        console.log(req.params.token);
        UserIndex.findOne({ token: req.params.token }).then(tk => {
            if (!tk)
                res.status(404).json({
                    success: false,
                    reason: "Token does not exist."
                });
            if (String(tk._userId) == String(req.user._id)) {
                User.findOne({
                    _id: req.user._id
                })
                    .then(profile => {
                        if (!profile)
                            res.status(404).json({
                                success: false,
                                reason: "Profile does not exist."
                            });
                        if (!profile.isVerified)
                            return res.status(401).json({
                                type: "not-verified",
                                reason: "Your account has not been verified."
                            });
                        res.status(200).json({
                            success: true,
                            msg: "acct is valid"
                        });
                    })
                    .catch(e => console.error(e));
            } else {
                res.status(403).json({
                    success: false,
                    reason:
                        "email token does not match current user cookie, please log into this computer to load the cookie into your memory"
                });
            }
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
    if (!isValid) {
        return res.status(400).json(errors);
    }

    User.findOne({
        email: req.body.email
    })
        .then(user => {
            errors.email = "User not found.";
            // Check for user
            if (!user) {
                return res.status(400).json(errors);
            }
            if (!user.isVerified) {
                errors.verified = "User not verified.";
                return res.status(400).json(errors);
            }
            //Check password
            bcrypt.compare(password, user.password).then(isMatch => {
                if (isMatch) {
                    //User matched
                    const payload = {
                        _id: user._id,
                        name: user.name,
                        email: user.email,
                        tier: user.tier
                    }; // create jwt payload
                    //Sign token
                    jwt.sign(
                        payload,
                        keys.secretOrKey,
                        {
                            expiresIn: "1d"
                        },
                        (err, token) => {
                            if (err)
                                res.status(500).json({
                                    success: false,
                                    reason: "unable to generate auth token.",
                                    moreDetailed: err
                                });
                            else
                                res.json({
                                    success: true,
                                    token: "Bearer " + token
                                });
                        }
                    );
                } else {
                    errors.password = "Password Incorrect.";
                    return res.status(400).json(errors);
                }
            });
        })
        .catch(e => console.error(e));
});

// ROUTE: GET user/current
// DESCRIPTION: returns current user
// INPUT: jwt token details
router.get('/current', passport.authenticate('jwt', {
    session: false
}), (req, res) => {
    User.findOne({
        email: req.user.email
    }).then(profile => {
        if (!profile) {
            res.status(404).json({ "err": "There isn't any such profile" });
        }
        res.json({
            externalId: profile.externalId,
            isVerified: profile.isVerified,
            tier: profile.tier,
            _id: profile._id,
            name: profile.name,
            email: profile.email,
            date: profile.date,
        });
    })
});
//exports current script as module
module.exports = router;