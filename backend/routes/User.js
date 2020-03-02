//import modules
const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const passport = require("passport");
const nodemailer = require("nodemailer");
const randomBytes = require("randombytes");
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
const Tag = require('../models/Tag.js');
//declare consts


// ROUTE: GET user/test
// DESCRIPTION: tests user route
// INPUT: none
router.get("/test", (req, res) => res.send("User Works"));

//mail setup
const smtpTransport = nodemailer.createTransport({
    sendmail: true,
    newline: 'unix',
    path: '/usr/sbin/sendmail'
        // service: 'gmail',
        // auth: {
        //     user: 'hokugpn@gmail.com',
        //     pass: 'Upgame11'
        // }
});

smtpTransport.on("error", err => {
    console.log("SMTP error: ", err.message);
});

smtpTransport.verify(function(error) {
    if (error) {
        console.error(error);
    } else {
        console.log("mailserver online.");
    }
});

function sendMail(body, sub, to, cb) {
    if (!process.env.testing) {
        smtpTransport.sendMail({
            from: "no-reply@" + process.env.topLevelDomain,
            to: to,
            subject: sub,
            text: body
        }, function(err) { if (err) cb(err) });
    } else {
        console.log({
            from: "no-reply@" + process.env.topLevelDomain,
            to: to,
            subject: sub,
            text: body
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
    if (!isValid) {
        return res.status(400).json({
            success: false,
            simple: "Invalid post body.",
            details: errors
        });
    }
    if (process.env.testing && req.body.email == "fake@test.com") { //check for testing var
        const newUser = new User({
            name: req.body.name,
            email: req.body.email,
            dashUrl: randomBytes(16).toString("hex").substring(8),
            password: req.body.password
        });

        bcrypt.genSalt(10, (err, salt) => {
            bcrypt.hash(newUser.password, salt, (err, hash) => {
                if (err) {
                    return res.json({
                        success: false,
                        simple: "Failed to generate password.",
                        details: err
                    });
                }
                newUser.password = hash;
                newUser.save(function(err) {
                    if (err) {
                        return res.status(500).json({
                            success: false,
                            simple: "Failed to save user.",
                            details: err.message
                        });
                    }
                    // Create a verification token for this user
                    User.findOne({
                            email: req.body.email
                        },
                        "_id"
                    ).exec(function(err, user) {
                        if (err) {
                            return res.status(500).json({
                                success: false,
                                simple: "Failed to find user.",
                                details: err.message
                            });
                        }
                        const vToken = new UserIndex({
                            _userId: user,
                            token: randomBytes(16).toString("hex"),
                            isCritical: true
                        });
                        vToken.save().then(p => res.json({
                            success: true,
                            email: "/user/confirmation/" + p.token
                        }));
                    });
                });
            });
        });
    } else {
        User.findOne({
                email: req.body.email
            })
            .then(user => {
                if (user) {
                    errors.email = "Email already exists";
                    return res.status(400).json({
                        success: false,
                        simple: "Invalid post body",
                        details: errors
                    });
                } else {
                    const newUser = new User({
                        name: req.body.name,
                        email: req.body.email,
                        dashUrl: randomBytes(16).toString("hex").substring(8),
                        password: req.body.password
                    });
                    bcrypt.genSalt(10, (err, salt) => {
                        bcrypt.hash(newUser.password, salt, (err, hash) => {
                            if (err) {
                                return res.json({
                                    success: false,
                                    simple: "Failed to generate password.",
                                    details: err
                                });
                            }
                            newUser.password = hash;
                            newUser.save(function(err) {
                                if (err) {
                                    return res.status(500).json({
                                        success: false,
                                        simple: "Failed to save user.",
                                        details: err.message
                                    });
                                }
                                // Create a verification token for this user
                                User.findOne({
                                    email: req.body.email
                                }, "_id").exec(function(err, user) {
                                    if (err) {
                                        return res.status(500).json({
                                            success: false,
                                            simple: "Failed to find user.",
                                            details: err.message
                                        });
                                    }
                                    const vToken = new UserIndex({
                                        _userId: user,
                                        token: randomBytes(16).toString("hex"),
                                        isCritical: true
                                    });
                                    vToken.save().then(p => {
                                        // Send the email

                                        sendMail(("Hello,\n\n" +
                                            "Please verify your account by clicking the link: \n" +
                                            process.env.domainPrefix + process.env.topLevelDomain +
                                            "/user/confirmation/" +
                                            p.token +
                                            ".\n"), ("CleanConnect Account Verification"), req.body.email, function(err) {
                                            if (err) {
                                                return res.status(500).json({
                                                    success: false,
                                                    simple: "Failed to send mail.",
                                                    details: err.message
                                                });
                                            }
                                        });
                                        console.log(process.env.domainPrefix + process.env.topLevelDomain + "/user/confirmation/" + p.token + "\n");
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

    User.findOne({ email: req.body.email }, function(err, user) {
        if (!user)
            return res.status(404).json({
                success: false,
                simple: "Unable to find user with this email.",
                details: err
            });
        if (user.isVerified) {
            return res.status(400).json({
                success: false,
                simple: "This user is already verified.",
                details: err
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
                sendMail(("Hello,\n\n" +
                    "Please verify your account by clicking the link: \n" +
                    process.env.domainPrefix + process.env.topLevelDomain +
                    "/user/confirmation/" +
                    p.token +
                    ".\n"), ("CleanConnect Account Verification"), req.body.email, function(err) {
                    if (err) {
                        return res.status(500).json({
                            success: false,
                            simple: "Failed to send mail.",
                            details: err.message
                        });
                    }
                });
                console.log(process.env.domainPrefix + process.env.topLevelDomain + "/user/confirmation/" + p.token + "\n");
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
        console.log(token);
        if (!token)
            return res.status(400).json({
                success: false,
                simple: "We were unable to find a valid token. Your token my have expired.",
                details: err
            });
        // If we found a token, find a matching user
        User.findOne({ _id: token._userId }, function(err, user) {
            if (!user)
                return res.status(400).json({
                    success: false,
                    simple: "We were unable to find a user with this token.",
                    details: err
                });
            if (user.isVerified) {
                return res.status(400).json({
                    success: false,
                    simple: "This user was already verified.",
                    details: err
                });
            }

            // Verify and save the user
            user.isVerified = true;
            user.save(function(err) {
                if (err) {
                    return res.status(500).json({
                        success: false,
                        simple: "Unable to save user.",
                        details: err
                    });
                }
                res.json({
                    success: true
                });
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
            sendMail(("Hello,\n\n" +
                "Please delete your account by clicking the link: \n" +
                process.env.domainPrefix + process.env.topLevelDomain +
                "/delete/" +
                p.token +
                ".\n"), ("CleanConnect Account Deletion"), req.user.email, function(err) {
                if (err) {
                    return res.status(500).json({
                        success: false,
                        simple: "Failed to send mail.",
                        details: err.message
                    });
                }
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
            User.findOneAndRemove({ _id: tk._userId })
            .then(UserIndex.findOneAndRemove({ _userId: tk._userId }))
            .then(Tag.deleteMany({ user: req.user._id }))
            .then(() => res.json({
                success: true
            }))
            .catch(e => console.error(e));
        else
            res.status(403).json({
                success: false,
                simple: "email token does not match current user cookie, please log into this computer to load the cookie into your memory",
                details: ""
            });
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
            sendMail(("Hello,\n\n" +
                "Please alter your account by clicking the link: \n" +
                process.env.domainPrefix + process.env.topLevelDomain +
                "/change/" +
                p.token +
                ".\n"), ("CleanConnect Account Changes"), req.user.email, function(err) {
                if (err) {
                    return res.status(500).json({
                        success: false,
                        simple: "Failed to send mail.",
                        details: err.message
                    });
                } else {
                    res.json({
                        success: true,
                        status: "A settings email has been sent to " + req.user.email + "."
                    })
                }
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
        profileFields.user = req.user._id;
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
                                } else {
                                    res.status(404).json({
                                        success: false,
                                        simple: "Profile does not exist."
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
                            simple: "email token does not match current user cookie, please log into this computer to load the cookie into your memory"
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
        UserIndex.findOne({ token: req.params.token }).then(tk => {
            if (!tk)
                res.status(404).json({
                    success: false,
                    simple: "Token does not exist."
                });
            if (String(tk._userId) == String(req.user._id)) {
                User.findOne({
                        _id: req.user._id
                    })
                    .then(profile => {
                        if (!profile)
                            res.status(404).json({
                                success: false,
                                simple: "Profile does not exist."
                            });
                        if (!profile.isVerified)
                            return res.status(401).json({
                                success: false,
                                simple: "Your account has not been verified."
                            });
                        res.status(200).json({
                            success: true
                        });
                    })
                    .catch(e => console.error(e));
            } else {
                res.status(403).json({
                    success: false,
                    status: "email token does not match current user cookie, please log into this computer to load the cookie into your memory"
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
        return res.status(400).json({
            success: false,
            simple: "Invalid login information.",
            details: errors
        });
    }

    User.findOne({
            email: req.body.email
        })
        .then(user => {
            errors.email = "User not found.";
            // Check for user
            if (!user) {
                return res.status(400).json({
                    success: false,
                    simple: "Invalid user information",
                    details: errors
                });
            }
            if (!user.isVerified) {
                errors.verified = "User not verified.";
                return res.status(400).json({
                    success: false,
                    simple: "Verification error.",
                    details: errors
                });
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
                            if (err)
                                res.status(500).json({
                                    success: false,
                                    simple: "unable to generate auth token.",
                                    details: err
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
                    return res.status(400).json({
                        success: false,
                        simple: "Invalid body.",
                        details: errors
                    });
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
            res.status(404).json({
                success: false,
                simple: "No profile found"
            });
        }
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
//exports current script as module
module.exports = router;