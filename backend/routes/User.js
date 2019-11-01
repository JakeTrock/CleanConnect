const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const passport = require('passport');

// stuff for pdf handling
const uuidv1 = require('uuid/v1');
const validate = require('uuid-validate');
// Load input validation
const validateRegisterInput = require('../validation/register');
const validateLoginInput = require('../validation/login');


const keys = require('../config/keys');

//Load user model
const User = require('../models/User');

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
                        .save()
                        .then(res.json({ "status": "success" }))
                        //.then(user => res.json(user))
                        .catch(err => console.log(err));
                });
            });
        }
    }).catch((e) => console.error(e));
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
router.delete('/', passport.authenticate('jwt', {
    session: false
}), (req, res) => {
    User.findOneAndRemove({ _id: req.user.id })
        .then(() => res.json({ success: true })).catch((e) => console.error(e));
});




router.post('/changeinfo', passport.authenticate('jwt', {
    session: false
}), (req, res) => {

    // Get fields

    const profileFields = {};
    profileFields.user = req.user.id;
    if (req.body.name) profileFields.name = req.body.name;
    if (req.body.email) profileFields.email = req.body.email;

    User.findOne({
            user: req.user.id
        })
        .then(profile => {
            if (profile) {
                //update a profile
                Profile.findOneAndUpdate({
                    user: req.user.id
                }, {
                    $set: profileFields
                }, {
                    new: true
                }).then(profile => res.json(profile)).catch((e) => console.error(e));
            }
        }).catch((e) => console.error(e));
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



module.exports = router;