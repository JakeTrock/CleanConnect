const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const passport = require('passport');

// stuff for pdf handling
const uuidv1 = require('uuid/v1');
const validate = require('uuid-validate');
const PDFDocument = require('pdfkit');
const QRCode = require('qrcode');
// Load input validation
const validateRegisterInput = require('../validation/register');
const validateLoginInput = require('../validation/login');


const keys = require('../config/keys');

//Load user model
const User = require('../models/User');

// @route GET User/test
// @desc Tests User route
// @access Public route
router.get('/test', (req, res) => res.json({
    msg: "User Works"
}));

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
                        throw err;
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
                return res.status(404).json(errors);
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
                            res.json({
                                success: true,
                                token: 'Bearer ' + token
                            });
                        });
                    } else {
                        errors.password = 'Password Incorrect.';
                        return res.status(400).json(errors);
                    }
                });
        });

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
        .then(() => res.json({ success: true }));
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
                }).then(profile => res.json(profile));
            }
        });
});




router.get('/:user_id', (req, res) => {

    const errors = {};
    User.findOne({
            user: req.params.user_id
        })
        .populate('user', ['name'])
        .then(profile => {
            if (!profile) {
                errors.noprofile = "There isn't any such profile";
                res.status(404).json(errors)
            }
            res.json(profile);
        }).catch(err => res.status(404).json({
            profile: 'There is no profile for this user.'
        }));
});

router.get('/pdf/:uuid', (req, res) => {
    var uu = req.params.uuid.split(".")[0];
    if (validate(uu)) res.sendFile('../../temp/' + uu + '.pdf');
    else res.status(404).json({
        error: "This pdf has been deleted to preserve the privacy of its user, or never existed in the first place. Pdf files are erased from the server one week after their creation, if you'd like to re-generate this pdf, please go to https://jancoord.co/profile/print"
    });
});
const gr = ["Does this room need to be cleaned? Scan this tag to report:", "Did something run out? Scan me:", "Something broken? Scan me:", "Scan this tag to alert the custodial staff.", "See a spill? Scan this to report it:"];
router.get('/print/', passport.authenticate('jwt', {
    session: false
}), (req, res) => {
    const fn = uuidv1();
    const doc = new PDFDocument({
        size: 'A4',
        margins: {
            left: 12.65,
            right: 12.65,
            top: 43.5,
            bottom: 43.5
        }
    });
    doc.pipe(fs.createWriteStream('./temp/' + fn + '.pdf'));
    var pgsw = 0;
    (async () => {
        const tl = await Post.find({ user: req.user.id });
        for (let i = 0; i < tl.length; i++) {
            QRCode.toDataURL("http://CleanConnect.com/tag/" + tl[i].tagid, function(error, url) {
                if (error) console.error(error);
                if (i == 7) {
                    pgsw = 285.7;
                }
                doc.rect(pgsw, i * 108, 281, 108) //change second element y fraction to how many stickers fit on page
                    .lineWidth(3)
                    .fillOpacity(0.8)
                    .fillAndStroke("grey", "#0f0f0f")
                    .text(gr[Math.ceil(Math.random() * (gr.length - 1))], pgsw, 50 + i * 108, {
                        width: 333.75,
                        align: 'right'
                    }).fill("#FFFFFF").text(tl[i].name, 103 + pgsw, 200 + i * 108, {
                        width: 173,
                        align: 'right'
                    }).fillOpacity(1).fill("#FFFFFF")
                    .image(url, pgsw, i * 108, { fit: [108, 108], });
                if (i == tl.length - 1) doc.end();
            });
        }
        //label spec: https://uk.onlinelabels.com/templates/eu30011-template-pdf.html
        //https://www.npmjs.com/package/pdfkit
    })();
    res.send("done");

    //res.redirect("/pdf/" + fn + ".pdf");
});
module.exports = router;