//import all libs
const express = require('express');
const fileUpload = require('express-fileupload');
const mongoose = require('mongoose');
const passport = require('passport');
const validate = require('uuid-validate');
const PDFDocument = require('pdfkit');
const QRCode = require('qrcode');
const SVGtoPDF = require('svg-to-pdfkit');
const uuidv1 = require('uuid/v1');
const fs = require('fs');
var async = require('async');
//Tag model import
const Tag = require('../models/Tag.js');
// Validation Part for input
const validatePostInput = require('../validation/tag.js');
const apr = require('../validation/apr.js');
//configure express addons
const app = express();
const router = express.Router();
router.use(fileUpload());
//document settings and blank template image for pdf creator
const fillImg = ' data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAKQAAACkAQMAAAAjexcCAAAACXBIWXMAAA7EAAAOxAGVKw4bAAAAA1BMVEX///+nxBvIAAAAGUlEQVQYGe3BAQEAAACCoP6vdkjAAAAAuBYOGAABPIptXAAAAABJRU5ErkJggg==';
const docsettings = [{ size: 'LETTER' }];
// ROUTE: GET tag/test
// DESCRIPTION: Tests post route
router.get('/test', (req, res) => res.send("Tag Works"));

// ROUTE: GET tag/getall
// DESCRIPTION: pregenerates qr codes, skipping tags that are already generated
router.get('/getall', passport.authenticate('jwt', {
    session: false
}), (req, res) => {
    Tag.find({
        user: req.user._id
    }).sort({
        dateLastAccessed: -1
    }).then(posts => res.json(posts)).catch(err => res.status(404).json({
        nopostsfound: "No posts found!!",
        moreDetailed: err
    }));
});
// ROUTE: GET tag/genimgs
// DESCRIPTION: gets all tags of user based on their session token id
router.get('/genimgs', passport.authenticate('jwt', {
    session: false
}), (req, res) => {
    Tag.find({
        user: req.user._id
    }, function (err, list) {
        async.forEachOf(list, function (pos, i, callback) {
            //create data url, call insertion function
            if (err) return callback(err);
            try {
                if (list[i].qrcode == undefined) {
                    QRCode.toDataURL('http://localhost:3000/tag/' + pos._id, function (err, url) {
                        if (err) console.log(err);
                        console.log(pos);
                        Tag.findOneAndUpdate({
                            _id: pos._id
                        }, {
                            qrcode: url
                        },{
                            new: true
                        });
                    });
                }
            } catch (e) {
                return callback(e)
            }
            //call callback when finished
            callback();
        }, err => {
            if (err) return console.error(err.message);
            res.json({ done: true });
        })
    });
});
// ROUTE: GET tag/getone/id
// DESCRIPTION: gets the metadata of a single tag based on its id, can also be used to confirm if a tag exists
router.get('/getone/:id', passport.authenticate('jwt', {
    session: false
}),
    (req, res) => {
        Tag.findOne({
            _id: req.params.id
        }).then(post => res.json(post))
            .catch(err => res.status(404).json({
                nopostsfound: "No posts found!!"
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
        return res.status(400).json(errors);
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
            }).save().then(post => res.json(post)).catch((e) => console.error(e));
        else
            res.status(400).json({
                success: false,
                reason: "Name not unique.",
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
        return res.status(400).json(errors);
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
            Tag.findOneAndUpdate({
                _id: req.params.id,
                user: req.user._id.toString()
            }, {
                $set: { name: tagName }
            }, {
                new: true
            }).then(res.json({ status: "success" }))
                .catch(e => console.error(e));
        else
            res.status(400).json({
                success: false,
                reason: "Name not unique.",
            });
    });

});

// ROUTE: DELETE tag/:id
// DESCRIPTION: allows user to delete given tag information
// INPUT: tag id via url bar

router.delete('/:id', passport.authenticate('jwt', {
    session: false
}), (req, res) => {
    Tag.findOne({
        _id: req.params.id,
        user: req.user.id
    })
        .then(post => {
            post.deleteOne().then(() => res.json({
                success: true
            }));
        })
        .catch(err => res.status(404).json({
            success: false,
            reason: "Tag not found",
            moreDetailed: err
        }));
});


// ROUTE: POST tag/comment/:id
// DESCRIPTION: allows unauthorized user to add a comment to a post
// INPUT: severity of issue(0 to 2, being worst), description of issue, and an optional image of the issue

router.post('/comment/:id', (req, res) => {
    const {
        errors,
        isValid
    } = apr(req.body);
    if (!req.body.sev || !isValid) {
        return res.status(400).json(errors);
    }
    Tag.findOne({
        _id: req.params.id
    }).then(post => {
        var comment;
        if (req.files) {
            let image = req.files.img;
            // console.log(typeof image);
            // console.log(image);
            if (image.size < 5100000 && (image.mimetype == "video/mp4" || image.mimetype == "video/webm" || image.mimetype == "image/webp" || image.mimetype == "image/gif" || image.mimetype == "image/jpeg" || image.mimetype == "image/png" || image.mimetype == "image/jpg" || image.mimetype == "image/tiff")) {
                const name = uuidv1() + "." + image.name.split(".")[1];
                image.mv('./temp/' + name);
                comment = {
                    img: name,
                    text: req.body.text,
                    sev: req.body.sev //severity 0 to 2, 0 being green, 2 being red
                };
            } else {
                return res.status(400).json({ "error": "invalid filetype" });
            }
        } else {
            comment = {
                text: req.body.text,
                sev: req.body.sev //severity 0 to 2, 0 being green, 2 being red
            };
        }
        // Add comment to the array
        post.comments.unshift(comment);
        post.dateLastAccessed = Date.now();
        //save
        post.save().then(post => res.json(post)).catch((e) => console.error(e));
    });
});

// ROUTE: DELETE api/posts/comment/:id/:comment
// DESCRIPTION: allows deletion of comment, most likely after it has been resolved
// INPUT: in the url bar, this first takes the id of the post, then the id of the child comment

router.delete('/comment/:id/:comment_id', passport.authenticate('jwt', {
    session: false
}), (req, res) => {
    Tag.findOne({
        _id: req.params.id,
        user: req.user.id
    }).then(post => {
        // Check if the comment exists
        if (post.comments.filter(comment => comment.cid.toString() === req.params.comment_id).length === 0) {
            return res.status(404).json({
                commentnotfound: "Your comment doesn't exist"
            });
        }
        // Get remove index

        const removeIndex = post.comments
            .map(item => item.cid.toString())
            .indexOf(req.params.comment_id);

        // Splice comment out of the array
        post.comments.splice(removeIndex, 1);

        post.save().then(res.json(post)).catch((e) => console.error(e));
    }).catch(err => res.status(404).json({
        success: false,
        reason: "Tag not found.",
        moreDetailed: err
    }));
});
// ROUTE: GET tag/print/
// DESCRIPTION: prints tags as qr codes, allowing people to access them in real life
// INPUT: an array as long as the number of tags you have, containing numbers which tell the program the number of times to print each tag, and an array of tags(in the same format as they are in getall)

router.get('/print/', passport.authenticate('jwt', {
    session: false
}), (req, res) => {
    const ts = req.body.tagSet;
    const pi = req.body.printIteration;
    var dat = [];
    for (var i = 0; i < ts.length; i++) {
        for (var b = 0; b < pi[i]; b++) {
            dat.push(ts[i]);
        }
    }
    fs.readFile(__dirname + '/template.svg', async function (err, data) {
        if (err) {
            console.error(err)
        }
        //svg template file
        var svgbuff = data.toString()
        //array of pages defined
        var pagesArray = [];
        //populate pages array with templates one for each ten< of data
        for (var h = 0; h < Math.ceil(dat.length / 10); h++) {
            pagesArray.push(svgbuff);
        }
        //cbuff stores page position
        var cbuff = 0;
        const doc = new PDFDocument(docsettings);
        const fn = uuidv1();
        //async qr generation
        for (var i = 0; i < dat.length; dat++) {
            //every tenth page, increment page position
            if (i != 0 && i % 10 == 0) {
                cbuff++
            }
            //replace image and room name dummy values with values from async function and json file
            pagesArray[cbuff] = pagesArray[cbuff].replace('Room ' + (i - (cbuff * 10)), dat[i].name)
            pagesArray[cbuff] = pagesArray[cbuff].replace('Img ' + (i - (cbuff * 10)), dat[i].qrcode)
        }
        //document write stream begins
        doc.pipe(fs.createWriteStream(__dirname + '/../temp/' + fn + '.pdf'));
        //for each page, add new pdf page, convert svg into pdf page content data and put it into place.
        for (var h = 0; h < pagesArray.length; h++) {
            if (pagesArray[h].indexOf("Room 9") !== -1) {
                for (var g = 0; g < 10; g++) {
                    pagesArray[cbuff] = pagesArray[cbuff].replace('Room ' + g, '')
                    pagesArray[cbuff] = pagesArray[cbuff].replace('Img ' + g, fillImg);
                }
            }
            SVGtoPDF(doc, pagesArray[h], 0, 0);
            doc.addPage();
        }
        //finish writing to document
        doc.end();
        //redirect user to pdf page
        res.json({ "filename": fn });
    })
});

//export module for importing into central server file
module.exports = router;

// router.get('/print/', passport.authenticate('jwt', {
//     session: false
// }), (req, res) => {
//     const ts = req.body.tagSet;
//     const pi = req.body.printIteration;
//     var dat = [];
//     for (var i = 0; i < ts.length; i++) {
//         for (var b = 0; b < pi[i]; b++) {
//             dat.push(ts[i]);
//         }
//     }
//     fs.readFile(__dirname + '/template.svg', async function (err, data) {
//         if (err) {
//             console.error(err)
//         }
//         //svg template file
//         var svgbuff = data.toString()
//         //array of pages defined
//         var pagesArray = [];
//         //populate pages array with templates one for each ten< of data
//         for (var h = 0; h < Math.ceil(dat.length / 10); h++) {
//             pagesArray.push(svgbuff);
//         }
//         //cbuff stores page position
//         var cbuff = 0;
//         const doc = new PDFDocument(docsettings);
//         const fn = uuidv1();
//         //async qr generation
//         async.forEachOf(
//             dat,
//             function (pos, i, callback) {
//                 //create data url, call insertion function
//                 QRCode.toDataURL('http://' + 'localhost:3000' + '/tag/' + pos._id, function (err, url) {
//                     if (err) return callback(err);
//                     try {
//                         //every tenth page, increment page position
//                         if (i != 0 && i % 10 == 0) {
//                             cbuff++
//                             console.log('up ' + cbuff)
//                         }
//                         console.log(pos.name)
//                         //replace image and room name dummy values with values from async function and json file
//                         pagesArray[cbuff] = pagesArray[cbuff].replace('Room ' + (i - (cbuff * 10)), pos.name)
//                         pagesArray[cbuff] = pagesArray[cbuff].replace('Img ' + (i - (cbuff * 10)), url)
//                     } catch (e) {
//                         return callback(e)
//                     }
//                     //call callback when finished
//                     callback();
//                 }
//                 )
//             },
//             err => {
//                 if (err) return console.error(err.message);
//                 //document write stream begins
//                 doc.pipe(fs.createWriteStream(__dirname + '/../temp/' + fn + '.pdf'));
//                 //for each page, add new pdf page, convert svg into pdf page content data and put it into place.
//                 for (var h = 0; h < pagesArray.length; h++) {
//                     if (pagesArray[h].indexOf("Room 9") !== -1) {
//                         for (var g = 0; g < 10; g++) {
//                             pagesArray[cbuff] = pagesArray[cbuff].replace('Room ' + g, '')
//                             pagesArray[cbuff] = pagesArray[cbuff].replace('Img ' + g, fillImg);
//                         }
//                     }
//                     SVGtoPDF(doc, pagesArray[h], 0, 0);
//                     doc.addPage();
//                 }
//                 //finish writing to document
//                 doc.end();
//                 //redirect user to pdf page
//                 //"https://" + "localhost:3000" + "/pdf/" + fn + ".pdf"
//                 res.json({ "filename": fn });
//             }
//         )
//     })
// });