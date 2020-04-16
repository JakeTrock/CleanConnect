//import all libs
const express = require('express');
const fileUpload = require('express-fileupload');
const passport = require('passport');
const PDFDocument = require('pdfkit');
const QRCode = require('qrcode');
const SVGtoPDF = require('svg-to-pdfkit');
const randomBytes = require("randombytes");
const fs = require('fs');
const erep = require("./erep.js");
const keys = require('../config/keys');
//model import
const Tag = require('../models/Tag.js');
const Comment = require('../models/Comment.js');
const User = require("../models/User");


// Validation Part for input
const validatePostInput = require('../validation/tag.js');
const isprintable = require('../validation/is-printable.js');
//configure express addons
const router = express.Router();
router.use(fileUpload());
//document settings and blank template image for pdf creator
const docsettings = [{ size: 'LETTER' }];
// ROUTE: GET tag/test
// DESCRIPTION: Tests post route
router.get('/test', (req, res) => res.send("Tag Works"));

// ROUTE: GET tag/getall
// DESCRIPTION: pregenerates qr codes, skipping tags that are already generated
router.post('/getall', passport.authenticate('jwt', {
    session: false
}), async(req, res) => {
    await Tag.find({
        user: req.user._id
    }).then(async posts => {
        if (posts) {
            for (var n = 0, len = posts.length; n < len; n++) {
                await Comment.find({
                    tag: posts[n]._id,
                    markedForDeletion: req.body.showDead
                }).then(cmts => {
                    if (cmts)
                        for (var z = 0, ln = cmts.length; z < ln; z++)
                            posts[n].comments.push(cmts[z]);
                });
            }
            res.json(posts);
        }
    }).catch(err => erep(res, err, 404, "No posts found", req.user._id));
});

// ROUTE: GET tag/getone/id
// DESCRIPTION: gets the metadata of a single tag based on its id, can also be used to confirm if a tag exists
router.get('/getone/:id', passport.authenticate('jwt', {
    session: false
}), (req, res) => {
    Tag.findOne({
        _id: req.params.id
    }).then(post => res.json(post)).catch(err => erep(res, err, 404, "No posts found", req.user._id));
});
// ROUTE: GET tag/exists/:id
// DESCRIPTION: sees if tag exists
router.get('/exists/:id', (req, res) => {
    Tag.findOne({
        _id: req.params.id
    }).then(post => res.json({ exists: (post != null) })).catch(err => erep(res, err, 404, "No posts found", req.user._id));
});
// ROUTE: POST tag/new
// DESCRIPTION: creates a new tag
// INPUT: requires a user name to link back to, and a unique room name
router.post('/new', passport.authenticate('jwt', {
    session: false
}), (req, res) => {
    User.findOne({ _id: req.user._id }).then(usr => {
        if (usr.numTags + 1 > keys.tagCeilings[usr.tier]) return erep(res, "", 400, "No more tags can be created with your current plan, please consider upgrading", req.user._id);
        // add tag node
        const {
            errors,
            isValid
        } = validatePostInput(req);
        if (!isValid) return erep(res, errors, 400, "Invalid post body", req.user._id);
        Tag.find({
            user: req.user._id,
            name: req.body.name
        }).then(posts => {
            if (posts[0]) return erep(res, "", 400, "Name not unique", req.user._id);
            User.findOneAndUpdate({
                _id: req.user._id
            }, {
                $inc: { numTags: 1 }
            }).then(() => {
                new Tag({
                    name: req.body.name,
                    user: req.user._id
                }).save((err, obj) => {
                    if (err) return erep(res, err, 500, "Error creating tag", req.user._id);
                    QRCode.toDataURL(process.env.domainPrefix + process.env.topLevelDomain + '/tag/' + obj._id, function(err, url) {
                        Tag.findOneAndUpdate({
                            name: req.body.name,
                            user: req.user._id
                        }, {
                            $set: { qrcode: url }
                        }, {
                            new: true
                        }).then(res.json({
                            success: true,
                            simple: "Successfully edited!"
                        }));
                    })
                });
            });
        });
    });
});

// ROUTE: POST tag/edit/:id
// DESCRIPTION: allows user to change current tag name to unique name
// INPUT: new tag name via json body
router.post('/edit/:id', passport.authenticate('jwt', {
    session: false
}), (req, res) => {
    //edit tag node
    var tagName = req.body.name;
    const {
        errors,
        isValid
    } = validatePostInput(req);
    if (!isValid) return erep(res, errors, 400, "Invalid post body.", req.user._id);
    var sc = true;
    Tag.find({
        user: req.user._id
    }).then(posts => {
        for (var n = 0, len = posts.length; n < len; n++)
            if (posts[n].name == tagName) sc = false;
        if (!sc) return erep(res, "", 400, "Name not unique", req.user._id);
        Tag.findOneAndUpdate({
                _id: req.params.id,
                user: req.user._id.toString()
            }, {
                $set: { name: tagName }
            }, {
                new: true
            }).then(res.json({ success: true }))
            .catch(e => erep(res, e, 500, "Error updating tag", req.user._id));
    });
});

// ROUTE: DELETE tag/:id
// DESCRIPTION: allows user to delete given tag information
// INPUT: tag id via url bar

router.delete('/delete/:id', passport.authenticate('jwt', {
    session: false
}), (req, res) => {
    Tag.findOne({
        _id: req.params.id,
        user: req.user.id
    }).then(post => {
        Comment.deleteMany({
            tag: post._id
        }).then(
            post.deleteOne().then(User.findOneAndUpdate({
                _id: req.user._id
            }, {
                $inc: { numTags: -1 }
            })).catch(err => erep(res, err, 404, "User not found", req.user._id))).then(() => res.json({
            success: true
        }));
    }).catch(err => erep(res, err, 404, "Tag not found", req.user._id));
});

// ROUTE: GET tag /print/
// DESCRIPTION: prints tags as qr codes, allowing people to access them in real life
// INPUT: an array as long as the number of tags you have, containing numbers which tell the program the number of times to print each tag, and an array of tags( in the same format as they are in getall)
router.post('/print/', passport.authenticate('jwt', {
    session: false
}), (req, res) => {
    Tag.find({
        user: req.user._id
    }, function(err, list) {
        const pi = req.body.printIteration;
        const {
            errors,
            isValid
        } = isprintable(req.body, list.length);
        if (!isValid) return erep(res, errors, 400, "Invalid post body", req.user._id);
        fs.readFile(__dirname + '/template.svg', function(err, data) {
            if (err) return erep(res, err, 500, "Error generating pdf", req.user._id);
            //svg template file
            var svgbuff = data.toString();
            //array of pages defined
            //cbuff stores page position
            var cbuff = 0;
            const doc = new PDFDocument(docsettings);
            const fn = randomBytes(16).toString("hex");

            doc.pipe(fs.createWriteStream(process.env.rootDir + '/temp/' + fn + '.pdf'));
            var b = 0;
            for (var g = 0, len = pi.length; g < len; g++) {
                for (var i = 0, ivl = pi[g]; i < ivl; i++) {
                    svgbuff = svgbuff.replace(`room${(b - (cbuff * 10))}`, list[g].name);
                    svgbuff = svgbuff.replace(`img${(b - (cbuff * 10))}`, list[g].qrcode);
                    svgbuff = svgbuff.replace(`<!-- bimgrp${(b - (cbuff * 10))} -->`, '');
                    svgbuff = svgbuff.replace(`<!-- ${(b - (cbuff * 10))}eimgrp -->`, '');
                    b++;
                    if (b != 0 && (b % 10 == 0 || (g == len - 1 && i == ivl - 1))) {
                        if ((g == len - 1 && i == ivl - 1)) {
                            if (svgbuff.indexOf("room9") !== -1) {
                                for (var r = 0, tm = 10; r < tm; r++) {
                                    svgbuff = svgbuff.replace(/(bimgrp)(.*?)(eimgrp)/, "");
                                }
                            }
                            SVGtoPDF(doc, svgbuff, 0, 0);
                            //finish writing to document
                            doc.end();
                            //redirect user to pdf page
                            res.json({
                                success: true,
                                filename: fn
                            });
                        } else {
                            SVGtoPDF(doc, svgbuff, 0, 0);
                            doc.addPage();
                            svgbuff = data.toString();
                            cbuff++; //every tenth page, increment page position
                        }
                    }
                }
            }
        });
    });
});


//export module for importing into central server file
module.exports = router;