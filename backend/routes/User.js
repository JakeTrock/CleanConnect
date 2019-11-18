const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const passport = require('passport');
const nodemailer = require('nodemailer');
const randomBytes = require('randombytes');
const CronJob = require('cron').CronJob;

// stuff for pdf handling
const uuidv1 = require('uuid/v1');
const validate = require('uuid-validate');
// Load input validation
const validateRegisterInput = require('../validation/register');
const validateLoginInput = require('../validation/login');


const keys = require('../config/keys');

//Load user model
const User = require('../models/User');
const UserIndex = require('../models/UserIndex');
const prefix = "http://";

//testing

const smtpTransport = nodemailer.createTransport({
    host: 'smtp.ethereal.email',
    port: 587,
    auth: {
        user: 'lilian.bernhard@ethereal.email',
        pass: 'fCc7CKMVv1VvuvrsaR'
    }
});
smtpTransport.verify(function(error, success) {
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
// @route GET User/test
// @desc Tests User route
// @access Public route
// router.get('/test', (req, res) => res.json({
//     msg: "User Works"
// }));



// @route GET User/register
// @desc Register a user
// @access Public route
router.post('/register', (req, res) => {
    const {
        errors,
        isValid
    } = validateRegisterInput(req.body);
    //check validation
    if (!isValid) {
        return res.status(400).json(errors);
    }
    User.findOne({
        email: req.body.email
    }).then(user => {
        if (user) {
            errors.email = 'Email already exists';
            return res.status(400).json(errors);
        } else {
            const newUser = new User({
                name: req.body.name,
                email: req.body.email,
                password: req.body.password,
            });

            bcrypt.genSalt(10, (err, salt) => {
                bcrypt.hash(newUser.password, salt, (err, hash) => {
                    if (err) {
                        console.log(err);
                    }
                    newUser.password = hash;
                    newUser
                        .save(function(err) {
                            if (err) {
                                return res.status(500).json({
                                    success: false,
                                    reason: "Failed to save user.",
                                    moreDetailed: err.message
                                });
                            }
                            // Create a verification token for this user
                            User.findOne({
                                email: req.body.email
                            }, 'internalId').exec(function(err, user) {
                                if (err) {
                                    return res.status(500).json({
                                        success: false,
                                        reason: "Failed to find user.",
                                        moreDetailed: err.message
                                    });
                                }
                                const vToken = new UserIndex({
                                    _userId: user._id,
                                    token: randomBytes(16).toString('hex'),
                                    isCritical: true
                                });
                                vToken.save().then(p => {
                                    // Send the email
                                    var mailOptions = { from: 'no-reply@' + req.headers.host, to: req.body.email, subject: 'Account Verification Token', text: 'Hello,\n\n' + 'Please verify your account by clicking the link: \n' + prefix + req.headers.host + '\/user\/confirmation\/' + p.token + '.\n' };
                                    console.log(req.headers.host + '\/user\/confirmation\/' + p.token + '.\n');
                                    smtpTransport.sendMail(mailOptions, function(err) {
                                        if (err) {
                                            return res.status(500).json({
                                                success: false,
                                                reason: "Failed to send mail.",
                                                moreDetailed: err.message
                                            });
                                        }
                                    });

                                }).then(res.json({ "status": "A verification email has been sent to " + req.body.email + "." })).catch(err => console.log(err));
                            });
                        });
                });
            });
        }
    }).catch((e) => console.error(e));
});

router.post('/resend', (req, res, next) => {
    // req.assert('email', 'Email is not valid').isEmail();
    // req.assert('email', 'Email cannot be blank').notEmpty();
    // req.sanitize('email').normalizeEmail({ remove_dots: false });

    // // Check for validation errors    
    // var errors = req.validationErrors();
    // if (errors) return res.status(400).send(errors);

    User.findOne({ email: req.body.email }, function(err, user) {
        if (!user) return res.status(400).send({ msg: 'We were unable to find a user with that email.' });
        if (user.isVerified) return res.status(400).send({ msg: 'This account has already been verified. Please log in.' });
        const vToken = new UserIndex({
            _userId: user._id,
            token: randomBytes(16).toString('hex'),
            isCritical: true
        });
        vToken.save().then(p => {
            // Send the email
            var mailOptions = { from: 'no-reply@' + req.headers.host, to: req.body.email, subject: 'Account Verification Token', text: 'Hello,\n\n' + 'Please verify your account by clicking the link: \n' + prefix + req.headers.host + '\/user\/confirmation\/' + p.token + '.\n' };
            console.log(req.headers.host + '\/user\/confirmation\/' + p.token + '.\n');
            smtpTransport.sendMail(mailOptions, function(err) {
                if (err) {
                    return res.status(500).json({
                        success: false,
                        reason: "Failed to send mail.",
                        moreDetailed: err.message
                    });
                }
            });

        }).then(res.json({ "status": "A verification email has been sent to " + req.body.email + "." })).catch(err => console.log(err));
    });
});

router.get('/confirmation/:token', (req, res, next) => {
    // const {
    //     errors,
    //     isValid
    // } = validateLoginInput(req.body);
    // //check validation
    // if (!isValid) {
    //     return res.status(400).json(errors);
    // }
    // Find a matching token
    UserIndex.findOne({ token: req.params.token }, function(err, token) {
        if (!token) return res.status(400).send({ type: 'not-verified', msg: 'We were unable to find a valid token. Your token my have expired.' });
        console.log(token);
        // If we found a token, find a matching user
        User.findOne({ _id: token._userId }, function(err, user) {
            console.log(user);
            if (!user) return res.status(400).send({ msg: 'We were unable to find a user for this token.' });
            if (user.isVerified) return res.status(400).send({ type: 'already-verified', msg: 'This user has already been verified.' });

            // Verify and save the user
            user.isVerified = true;
            user.save(function(err) {
                if (err) { return res.status(500).send({ msg: err.message }); }
                res.redirect(prefix + req.headers.host + "/login");
            });
        });
    });
});

router.delete('/deleteinfo', passport.authenticate('jwt', {
    session: false
}), (req, res) => {
    const vToken = new UserIndex({
        _userId: req.user.id,
        token: randomBytes(16).toString('hex'),
        isCritical: false
    });
    vtoken.save().then(p => {
        // Send the email
        var mailOptions = { from: 'no-reply@' + req.headers.host, to: req.body.email, subject: 'Account Deletion', text: 'Hello,\n\n' + 'Please delete your account by clicking the link: \n' + prefix + req.headers.host + '\/delete\/' + p.token + '.\n' };
        smtpTransport.sendMail(mailOptions, function(err) {
            if (err) {
                return res.status(500).json({
                    success: false,
                    reason: "Failed to send mail.",
                    moreDetailed: err.message
                });
            }
        });

    }).then(res.json({ "status": "A deletion email has been sent to " + req.body.email + "." })).catch(err => console.log(err));
});

router.get('/delete/:token', passport.authenticate('jwt', {
    session: false
}), (req, res) => {
    UserIndex.findOne({ token: req.params.token }).then(tk => {
        if (tk._userId == req.user.id)
            User.findOneAndRemove({ internalId: tk._userId })
            .then(UserIndex.findOneAndRemove({ _userId: tk._userId }))
            .then(() => res.json({ success: true })).catch((e) => console.error(e));
        else res.json({ success: false, reason: "email token does not match current user cookie, please log into this computer to load the cookie into your memory" });
    });
});


router.post('/changeinfo', passport.authenticate('jwt', {
    session: false
}), (req, res) => {
    const vToken = new UserIndex({
        _userId: req.user.id,
        token: randomBytes(16).toString('hex'),
        isCritical: false
    });
    vToken.save().then(p => {
        // Send the email
        var mailOptions = { from: 'no-reply@' + req.headers.host, to: req.body.email, subject: 'Account Changes', text: 'Hello,\n\n' + 'Please alter your account by clicking the link: \n' + prefix + req.headers.host + '\/change\/' + p.token + '.\n' };
        smtpTransport.sendMail(mailOptions, function(err) {
            if (err) {
                return res.status(500).json({
                    success: false,
                    reason: "Failed to send mail.",
                    moreDetailed: err.message
                });
            }
        });

    }).then(res.json({ "status": "A settings email has been sent to " + req.body.email + "." })).catch(err => console.log(err));
});

router.post('/change/:token', passport.authenticate('jwt', {
    session: false
}), (req, res) => {

    // Get fields

    const profileFields = {};
    profileFields.user = req.user.id;
    if (req.body.name) profileFields.name = req.body.name;
    if (req.body.email) profileFields.email = req.body.email;
    UserIndex.findOne({ token: req.params.token }).then(tk => {
        if (tk._userId == req.user.id) {
            User.findOne({
                    internalId: req.user.id
                })
                .then(profile => {
                    if (profile) {
                        //update a profile
                        Profile.findOneAndUpdate({
                            internalId: req.user.id
                        }, {
                            $set: profileFields
                        }, {
                            new: true
                        }).then(profile => res.json(profile)).catch((e) => console.error(e));
                    }
                }).then(UserIndex.findOneAndRemove({ _userId: tk._userId }))
                .catch((e) => console.error(e));

        } else res.json({ success: false, reason: "email token does not match current user cookie, please log into this computer to load the cookie into your memory" });

    });
});





// @route GET User/login
// @desc Login User / Returning JWT Token
// @access Public

router.post('/login', (req, res) => {

    const email = req.body.email;
    const password = req.body.password;

    //Find User by email
    const {
        errors,
        isValid
    } = validateLoginInput(req.body);
    //check validation
    if (!isValid) {
        return res.status(400).json(errors);
    }

    User.findOne({
            email
        })
        .then(user => {
            errors.email = 'User not found.';
            // Check for user
            if (!user) {
                return res.status(400).json(errors);
            }
            //Check password
            bcrypt.compare(password, user.password)
                .then(isMatch => {
                    if (isMatch) {
                        //User matched
                        const payload = {
                            id: user.id,
                            name: user.name
                        }; // create jwt payload
                        if (!user.isVerified) return res.status(401).send({ type: 'not-verified', msg: 'Your account has not been verified.' });
                        //Sign token
                        jwt.sign(payload, keys.secretOrKey, {
                            expiresIn: "1d"
                        }, (err, token) => {
                            if (err) res.json({
                                success: false,
                                reason: "unable to generate auth token.",
                                moreDetailed: err
                            });
                            else res.json({
                                success: true,
                                token: 'Bearer ' + token
                            });
                        });
                    } else {
                        errors.password = 'Password Incorrect.';
                        return res.status(400).json(errors);
                    }
                });
        }).catch((e) => console.error(e));

});

// @route GET User/current
// @desc Return current user
// @access Private
router.get('/current', passport.authenticate('jwt', {
    session: false
}), (req, res) => {
    res.json({
        id: req.user.id,
        name: req.user.name,
        email: req.user.email
    });
});

router.get('/:id', (req, res) => {
    if (validate(req.params.id)) {
        const errors = {};
        User.findOne({
                externalId: req.params.id
            })
            .populate('user', ['name'])
            .then(profile => {
                if (!profile) {
                    errors.noprofile = "There isn't any such profile";
                    res.status(404).json(errors)
                }
                res.json(profile);
            }).catch(err => res.status(404).json({
                success: false,
                reason: "There is no profile for this user.",
                moreDetailed: err
            }));
    } else res.status(400).json({
        success: false,
        reason: "Bad url",
        moreDetailed: "please retype url, or check if the link you used was broken"
    });
});

const delExp = new CronJob('00 00 00 * * *', function() {
    console.log('Goodnight, time to delete some tags! (-_-)ᶻᶻᶻᶻ');
    var d = new Date();
    d.setDate(d.getDate() - 7);
    db.mycollection.
    UserIndex.find({ isCritical: true, created_at: { $gt: d } }).forEach(function(err, doc) {
        if (err) console.log(err);
        console.log(doc);
        User.findOneAndRemove({ isVerified: false, internalId: doc._userId });
    });
});
delExp.start();

module.exports = router;