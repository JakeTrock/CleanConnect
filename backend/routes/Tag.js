//import all libs
const express = require('express');
const fileUpload = require('express-fileupload');
const passport = require('passport');
const PDFDocument = require('pdfkit');
const QRCode = require('qrcode');
const SVGtoPDF = require('svg-to-pdfkit');
const randomBytes = require("randombytes");
const fs = require('fs');
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
        user: req.user._id,
        markedForDeletion: req.body.showDead
    }).then(async posts => {
        if (posts) {
            for (var n in posts) {
                await Comment.find({
                    tag: posts[n]._id,
                    markedForDeletion: false
                }).then(cmts => {
                    if (cmts) {
                        var tmpcmt = [];
                        for (var z in cmts) {
                            tmpcmt.push(cmts[z]);
                        }
                        posts[n].comments = tmpcmt;
                    }
                });
            }
            res.json(posts);
        }
    }).catch(err => res.status(404).json({
        success: false,
        simple: "No posts found.",
        details: err
    }));
});

// ROUTE: GET tag/getone/id
// DESCRIPTION: gets the metadata of a single tag based on its id, can also be used to confirm if a tag exists
router.get('/getone/:id', passport.authenticate('jwt', {
        session: false
    }),
    (req, res) => {
        Tag.findOne({
            _id: req.params.id
        }).catch(err => res.status(404).json({
            success: false,
            simple: "No posts found.",
            details: err
        }));
    });
// ROUTE: GET tag/exists/:id
// DESCRIPTION: sees if tag exists
router.get('/exists/:id', (req, res) => {
    Tag.findOne({
        _id: req.params.id
    }).then(post => res.json({ exists: (post != null) })).catch(err => res.status(404).json({
        exists: false,
        error: err
    }));
});
// ROUTE: POST tag/new
// DESCRIPTION: creates a new tag
// INPUT: requires a user name to link back to, and a unique room name
router.post('/new', passport.authenticate('jwt', {
    session: false
}), (req, res) => {
    //add tag node
    var tagName = req.body.name;
    const {
        errors,
        isValid
    } = validatePostInput(req);
    if (!isValid) {
        return res.status(400).json({
            success: false,
            simple: "Invalid post body.",
            details: errors
        });
    }
    var sc = true;
    Tag.find({
        user: req.user._id
    }).then(posts => {
        for (var n in posts) {
            var p = posts[n].name;
            if (p == tagName) {
                sc = false;
            }
        }
        if (sc)
            new Tag({
                name: tagName,
                user: req.user._id
            }).save((err, obj) => {
                if (err) {
                    return res.status(500).json({
                        success: false,
                        simple: "Error creating tag.",
                        details: err
                    });
                }
                QRCode.toDataURL(process.env.domainPrefix + process.env.topLevelDomain + '/tag/' + obj._id, function(err, url) {
                    Tag.findOneAndUpdate({
                        name: tagName,
                        user: req.user._id
                    }, {
                        $set: { qrcode: url }
                    }, {
                        new: true
                    }).then(res.json({
                        success: true
                    }))
                })
            });
        else
            res.status(400).json({
                success: false,
                simple: "Name not unique."
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
    if (!isValid) {
        return res.status(400).json({
            success: false,
            simple: "Invalid post body.",
            details: errors
        });
    }
    var sc = true;
    Tag.find({
        user: req.user._id
    }).then(posts => {
        for (var n in posts) {
            var p = posts[n].name;
            if (p == tagName) {
                sc = false;
            }
        }
        if (sc) {
            Tag.findOneAndUpdate({
                    _id: req.params.id,
                    user: req.user._id.toString()
                }, {
                    $set: { name: tagName }
                }, {
                    new: true
                }).then(res.json({ success: true }))
                .catch(e => res.json({
                    success: false,
                    simple: "Error updating tag",
                    details: e
                }));
        } else {
            res.status(400).json({
                success: false,
                simple: "Name not unique."
            });
        }
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
        post.markedForDeletion = true;
        post.removedAt = new Date();
        Comment.find({
            tag: post._id
        }).then(cmts => {
            if (cmts) {
                for (var n in cmts) {
                    n.markedForDeletion = true;
                    n.removedAt = new Date();
                }
            }
        }).catch(err => res.status(404).json({
            success: false,
            simple: "No posts found.",
            details: err
        }));
        post.save().then(() => res.json({
            success: true
        }));
    }).catch(err => res.status(404).json({
        success: false,
        simple: "Tag not found",
        details: err
    }));
});

// ROUTE: POST tag/:id
// DESCRIPTION: allows user to restore deleted tag information
// INPUT: tag id via url bar

router.post('/restore/:id', passport.authenticate('jwt', {
    session: false
}), (req, res) => {
    Tag.findOne({
        _id: req.params.id,
        user: req.user.id
    }).then(post => {
        post.markedForDeletion = false;
        post.removedAt = null;
        Comment.find({
            tag: post._id
        }).then(cmts => {
            if (cmts) {
                for (var n in cmts) {
                    n.markedForDeletion = false;
                    n.removedAt = null;
                }
            }
        }).catch(err => res.status(404).json({
            success: false,
            simple: "No posts found.",
            details: err
        }));
        post.save().then(() => res.json({
            success: true
        }));
    }).catch(err => res.status(404).json({
        success: false,
        simple: "Tag not found",
        details: err
    }));
});

// ROUTE: GET tag/print/
// DESCRIPTION: prints tags as qr codes, allowing people to access them in real life
// INPUT: an array as long as the number of tags you have, containing numbers which tell the program the number of times to print each tag, and an array of tags(in the same format as they are in getall)

router.post('/print/', passport.authenticate('jwt', {
    session: false
}), (req, res) => {
    Tag.find({
        user: req.user._id,
        markedForDeletion: false
    }, function(err, list) {
        const pi = req.body.printIteration;
        const {
            errors,
            isValid
        } = isprintable(req.body, list.length);
        if (!isValid) {
            return res.status(400).json({
                success: false,
                simple: "Invalid post body.",
                details: errors
            });
        }
        fs.readFile(__dirname + '/template.svg', function(err, data) {
            if (err) {
                res.status(500).json({
                    success: false,
                    simple: "Error generating pdf.",
                    details: err
                })
            }
            //svg template file
            var svgbuff = data.toString();
            //array of pages defined
            //cbuff stores page position
            var cbuff = 0;
            const doc = new PDFDocument(docsettings);
            const fn = randomBytes(16).toString("hex");

            doc.pipe(fs.createWriteStream(process.env.rootDir + '/temp/' + fn + '.pdf'));
            var b = 0;
            for (var g = 0; g < pi.length; g++) {
                for (var i = 0; i < pi[g]; i++) {
                    svgbuff = svgbuff.replace(`room${(b - (cbuff * 10))}`, list[g].name);
                    svgbuff = svgbuff.replace(`img${(b - (cbuff * 10))}`, list[g].qrcode);
                    svgbuff = svgbuff.replace(`<!-- bimgrp${(b - (cbuff * 10))} -->`, '');
                    svgbuff = svgbuff.replace(`<!-- ${(b - (cbuff * 10))}eimgrp -->`, '');
                    b++;
                    console.log(b);
                    if (b != 0 && (b % 10 == 0 || (g == pi.length - 1 && i == pi[g] - 1))) {
                        if ((g == pi.length - 1 && i == pi[g] - 1)) {
                            console.log("ffffff");
                            if (svgbuff.indexOf("room9") !== -1) {
                                for (var r = 0; r < 10; r++) {
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

// ROUTE: GET tag/dash/:id
// DESCRIPTION: anonymous dashboard only accessible with secret keystring
router.get('/dash/:id', async(req, res) => {
    await User.findOne({
        dashUrl: req.params.id
    }).then(async user => {
        await Tag.find({
            user: user._id
        }).then(async posts => {
            if (posts) {
                for (var n in posts) {
                    await Comment.find({
                        tag: posts[n]._id
                    }).then(cmts => {
                        if (cmts) {
                            var tmpcmt = [];
                            for (var z in cmts) {
                                tmpcmt.push(cmts[z]);
                            }
                            posts[n].comments = tmpcmt;
                        }
                    });
                }
                res.json(posts);
            }
        }).catch(err => res.status(404).json({
            success: false,
            simple: "No posts found.",
            details: err
        }));
    }).catch(err => res.status(404).json({
        success: false,
        simple: "No users found.",
        details: err
    }));
});

//export module for importing into central server file
module.exports = router;