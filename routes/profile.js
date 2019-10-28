const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const passport = require('passport');
const fs = require('fs');
// Load validation
const validateProfleInput = require('../validation/profile');

const validate = require('uuid-validate');
// load profile model
const uuidv1 = require('uuid/v1');
const PDFDocument = require('pdfkit');
const Profile = require('../models/Profile');
const User = require('../models/User');
const Post = require('../models/Tag');
const QRCode = require('qrcode');
const path = require('path');


router.get('/test', (req, res) => res.json({
    msg: "Profile Works"
}));


// @route GET api/profile/test
// @desc Get current users profile
// @access Private route

router.get('/', passport.authenticate('jwt', {
    session: false
}), (req, res) => {
    const errors = {};

    Profile.findOne({
            user: req.user.id
        })
        .populate('user', ['name'])
        .then(profile => {
            if (!profile) {
                errors.noprofile = "There is no such profile.";
                return res.status(404).json(errors);
            }
            res.json(profile)
        })
        .catch(err => res.status(404).json(err));
});

// @route GET api/profile/all
// @desc GET all the profiles in the database
// @access  Public route

router.get('/all', (req, res) => {
    const errors = {};
    Profile.find()
        .populate('user', ['name'])
        .then(profiles => {
            if (!profiles) {
                errors.noprofiles = 'There are no profiles'
                return res.status(404).json(errors);
            }
            res.json(profiles);
        }).catch(err => res.status(404).json({
            profile: 'There are no profiles'
        }));
});

// @route GET api/profile/handle/ :handle
// @desc Get profile by handle
// @access Public route

router.get('/handle/:handle', (req, res) => {

    const errors = {}
    Profile.findOne({
            handle: req.params.handle
        })
        .populate('user', ['name'])
        .then(profile => {
            if (!profile) {
                errors.noprofile = "There isn't any such profile";
                res.status(404).json(errors)
            }
            res.json(profile);
        }).catch(err => res.status(404).json(err));
});


// @route GET api/profile/user/:user_id
// @desc Get profile by user ID
// @access Public

router.get('/user/:user_id', (req, res) => {

    const errors = {};
    Profile.findOne({
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

// @route POST api/profile
// @desc Create or edit user profile
// @acces Private route.

router.post('/', passport.authenticate('jwt', {
    session: false
}), (req, res) => {

    const {
        errors,
        isValid
    } = validateProfleInput(req.body);

    // Check validation
    if (!isValid) {
        // Return an errors with 400 status
        return res.status(400).json(errors);
    }
    // Get fields

    const profileFields = {};
    profileFields.user = req.user.id;
    if (req.body.handle) profileFields.handle = req.body.handle;
    if (req.body.tags) profileFields.tags = req.body.newtag;
    if (req.body.names) profileFields.names = req.body.newname;



    Profile.findOne({
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
            } else {
                // create
                // check to see if the handle exists.
                Profile.findOne({
                    handle: profileFields.handle
                }).then(profile => {
                    if (profile) {
                        errors.handle = 'Handle already exists';
                        res.status(400).json(errors);
                    }
                    // save profile

                    new Profile(profileFields).save().then(profile => res.json(profile));
                });
            }
        });

});
// @route DELETE api/profile
// @desc Delete User and profile
// @access Private Route
router.delete('/', passport.authenticate('jwt', {
    session: false
}), (req, res) => {
    Profile.findOneAndRemove({ user: req.user.id })
        .then(() => {
            User.findOneAndRemove({ _id: req.user.id })
                .then(() => res.json({ success: true }));
        });
});

module.exports = router;