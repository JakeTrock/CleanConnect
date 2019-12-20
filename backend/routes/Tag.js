const express = require('express');
const fileUpload = require('express-fileupload');
const router = express.Router();
router.use(fileUpload());
const mongoose = require('mongoose');
const passport = require('passport');
const validate = require('uuid-validate');
const PDFDocument = require('pdfkit');
const QRCode = require('qrcode');
const SVGtoPDF = require('svg-to-pdfkit');
const fs = require('fs');
var async = require('async');
//Post model
const Post = require('../models/Tag');
const uuidv1 = require('uuid/v1');
// Validation Part for input
const validatePostInput = require('../validation/tag');
const apr = require('../validation/apr');
const app = express();
app.use(bodyParser.json({ limit: '5mb' }))
const fillImg = ' data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAKQAAACkAQMAAAAjexcCAAAACXBIWXMAAA7EAAAOxAGVKw4bAAAAA1BMVEX///+nxBvIAAAAGUlEQVQYGe3BAQEAAACCoP6vdkjAAAAAuBYOGAABPIptXAAAAABJRU5ErkJggg==';
const docsettings = [{ size: 'LETTER' }];
// @route GET api/posts/test
// @desc Tests post route
// @access Public route
router.get('/test', (req, res) => res.send("Tag Works"));
// @route GET api/posts
// @desc Get all the post
// @access Public
router.get('/getall', passport.authenticate('jwt', {
    session: false
}),
    (req, res) => {
        console.log(req.user);
        Post.find({
            user: req.user._id
        })
            .sort({
                dateLastAccessed: -1
            })
            .then(posts => res.json(posts))
            .catch(err => res.status(404).json({
                nopostsfound: "No posts found!!"
            }));
    });
// @route GET api/posts
// @desc Get all the post
// @access Public
router.get('/getone/:id', passport.authenticate('jwt', {
    session: false
}),
    (req, res) => {
        Post.findOne({
            _id: req.params.id
        }).then(post => res.json(post))
            .catch(err => res.status(404).json({
                nopostsfound: "No posts found!!"
            }));
    });
// @route POST api/posts
// @desc Create post
// @access Private route

router.post('/new', passport.authenticate('jwt', {
    session: false
}), (req, res) => {
    //add tag node
    var sc = true;
    Post.find({
        user: req.user._id
    }).then(posts => {
        for (var n in posts) {
            var p = posts[n].name;
            if (p == req.body.name) {
                sc = false;
            }
        }
        if (sc)
            new Post({
                name: req.body.name,
                user: req.user._id
            }).save().then(post => res.json(post)).catch((e) => console.error(e));
        else
            res.status(400).json({
                success: false,
                reason: "Name not unique.",
            });
    });

});

router.post('/edit/:id', passport.authenticate('jwt', {
    session: false
}), (req, res) => {
    //edit tag node
    var sc = true;
    console.log(req.user);
    console.log(req.user._id);

    Post.find({
        user: req.user._id
    }).then(posts => {
        for (var n in posts) {
            var p = posts[n].name;
            if (p == req.body.name) {
                sc = false;
            }
        }
        if (sc)
            Post.findOneAndUpdate({
                _id: req.params.id,
                user: req.user._id.toString()
            }, {
                $set: { name: req.body.name }
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

// @route DELETE api/post/:id
// @desc DELETE a post by its id
// @access Private route

router.delete('/:id', passport.authenticate('jwt', {
    session: false
}), (req, res) => {
    //current user
    // Post.findOne({
    //     user: req.user.id
    // }).then(profile => {
    Post.findOne({
        _id: req.params.id,
        user: req.user.id
    })
        .then(post => {
            //Check the post owner
            // if (post.user.toString() !== req.user.id) {
            //     return res.status(401).json({
            //         success: false,
            //         reason: "User not authorized"
            //     });
            // }
            // Delete
            post.deleteOne().then(() => res.json({
                success: true
            }));
        })
        .catch(err => res.status(404).json({
            success: false,
            reason: "Post not found",
            moreDetailed: err
        }));
    // });
});


// @route POST api/posts/comment/:id
// @desc Add comment to post
// @access Privte Route

router.post('/comment/:id', (req, res) => {
    const {
        errors,
        isValid
    } = apr(req.body);
    if (!req.body.sev || !isValid || !req.files) {
        return res.status(400).json(errors);
    }
    Post.findOne({
        _id: req.params.id
    }).then(post => {
        let image = req.files.img;
        console.log(typeof image);
        console.log(image);
        if(image.name.split(".")[1]=="gif"||image.name.split(".")[1]=="jpeg"||image.name.split(".")[1]=="png"||image.name.split(".")[1]=="jpg"||image.name.split(".")[1]=="tiff"){
        const name = uuidv1() + "." + image.name.split(".")[1];
        image.mv('./temp/' + name);
        const newComment = {
            img: name,
            text: req.body.text,
            sev: req.body.sev //severity 0 to 2, 0 being green, 2 being red
        };

        // Add comment to the array
        post.comments.unshift(newComment);
        post.dateLastAccessed = Date.now();
        //save
        post.save().then(post => res.json(post)).catch((e) => console.error(e));
    }else{
        return res.status(400).json({"error":"invalid filetype"});
    }
    }).catch(err => console.log(err));
});

// @route DELETE api/posts/comment/:id/:comment_id
// @desc DELETE a comment
// @access Private route

router.delete('/comment/:id/:comment_id', passport.authenticate('jwt', {
    session: false
}), (req, res) => {
    Post.findOne({
        _id: req.params.id,
        user: req.user.id
    }).then(post => {
        // Check if the comment exists
        if (post.comments.filter(comment => comment._id.toString() === req.params.comment_id).length === 0) {
            return res.status(404).json({
                commentnotfound: "Your comment doesn't exist"
            });
        }
        // Get remove index

        const removeIndex = post.comments
            .map(item => item._id.toString())
            .indexOf(req.params.comment_id);

        // Splice comment out of the array
        post.comments.splice(removeIndex, 1);

        post.save().then(res.json(post)).catch((e) => console.error(e));
    }).catch(err => res.status(404).json({
        success: false,
        reason: "Post not found.",
        moreDetailed: err
    }));
});

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
        async.forEachOf(
            dat,
            function (pos, i, callback) {
                //create data url, call insertion function
                QRCode.toDataURL('http://' + 'localhost:3000' + '/tag/' + pos._id, function (err, url) {
                    if (err) return callback(err);
                    try {
                        //every tenth page, increment page position
                        if (i != 0 && i % 10 == 0) {
                            cbuff++
                            console.log('up ' + cbuff)
                        }
                        console.log(pos.name)
                        //replace image and room name dummy values with values from async function and json file
                        pagesArray[cbuff] = pagesArray[cbuff].replace('Room ' + (i - (cbuff * 10)), pos.name)
                        pagesArray[cbuff] = pagesArray[cbuff].replace('Img ' + (i - (cbuff * 10)), url)
                    } catch (e) {
                        return callback(e)
                    }
                    //call callback when finished
                    callback();
                }
                )
            },
            err => {
                if (err) return console.error(err.message);
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
                res.redirect("https://" + "localhost:3000" + "/pdf/" + fn + ".pdf");
            }
        )
    })
});

module.exports = router;



// Post.find({
//     user: req.user._id
// }).then(dat => function (dat) {
//     console.log("dat:" + dat);
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
//                 res.redirect("https://" + "localhost:3000" + "/pdf/" + fn + ".pdf");
//             }
//         )
//     })
// }).catch(err => res.status(404).json({
//     nopostsfound: "No posts found!!",
//     moreDetailed: err
// }));