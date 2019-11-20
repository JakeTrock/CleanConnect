const express = require('express');
const fileUpload = require('express-fileupload');
const router = express.Router();
router.use(fileUpload());
const mongoose = require('mongoose');
const passport = require('passport');
const validate = require('uuid-validate');
const PDFDocument = require('pdfkit');
const QRCode = require('qrcode');
//Post model
const Post = require('../models/Tag');


const uuidv1 = require('uuid/v1');

// Validation Part for input
const validatePostInput = require('../validation/tag');

const apr = require('../validation/apr');

const app = express();

// @route GET api/posts/test
// @desc Tests post route
// @access Public route
router.get('/test', (req, res) => res.send("Tag Works"));
// @route GET api/posts
// @desc Get all the post
// @access Public
// router.get('/', (req, res) => {
//     Post.find()
//         .sort({
//             date: -1
//         })
//         .then(posts => res.json(posts))
//         .catch(err => res.status(404).json({
//             nopostsfound: "No posts found!!"
//         }));
// });
// @route GET api/posts
// @desc Get all the post
// @access Public
router.get('/:user', (req, res) => {
    Post.find({
            user: req.params.user
        })
        .sort({
            dateLastAccessed: -1
        })
        .then(posts => res.json(posts))
        .catch(err => res.status(404).json({
            nopostsfound: "No posts found!!"
        }));
});
// @route GET api/posts/:id
// @desc Get all the post
// @access Public
// router.get('/:id', (req, res) => {
//     if (validate(req.params.id)) {
//         Post.findOne({
//                 tagid: req.params.id
//             })
//             .then(post => {
//                 if (!post) {
//                     res.status(404).json({
//                         success: false,
//                         error: "Room not found(maybe it was deleted?).",
//                         moreDetailed: "room not found"
//                     });
//                 }
//                 res.json(post);
//             }).catch(err => res.status(404).json({
//                 success: false,
//                 reason: "Room not found(maybe it was deleted?).",
//                 moreDetailed: err
//             }));
//     } else {
//         res.status(404).json({
//             success: false,
//             reason: "Room not found(maybe it was deleted?).",
//         });
//     }
// });

// router.get('/comment/:id/:comment_id', passport.authenticate('jwt', {
//     session: false
// }), (req, res) => {
//     if(validate(req.params.id)){
//     Post.findOne({
//         tagid: req.params.id
//     }).then(post => {
//         // Check if the comment exists
//         if (post.comments.filter(comment => comment._id.toString() === req.params.comment_id).length === 0) {
//             return res.status(404).json({
//                 commentnotfound: "Your comment doesn't exist"
//             });
//         }
//         // Get remove index
//         res.json(post.comments.filter(comment => comment._id.toString() === req.params.comment_id));
//     }).catch(err => res.status(404).json({
//         success: false,
//         reason: "Post not found",
//         moreDetailed: err
//     }));
//     } else res.status(400).json({
//         success: false,
//         reason: "Bad url",
//         moreDetailed: "please retype url, or check if the link you used was broken"
//     });
// });
// @route POST api/posts
// @desc Create post
// @access Private route

router.post('/', passport.authenticate('jwt', {
    session: false
}), (req, res) => {
    //add tag node
    const newPost = new Post({
        name: req.body.name,
        user: req.user.id
    });
    newPost.save().then(post => res.json(post)).catch((e) => console.error(e));
});

// @route DELETE api/post/:id
// @desc DELETE a post by its id
// @access Private route

router.delete('/:id', passport.authenticate('jwt', {
    session: false
}), (req, res) => {
    //current user
    if (validate(req.user.id)) {
        Post.findOne({
                user: req.user.id
            })
            .then(profile => {
                Post.findOne({
                        tagid: req.params.id
                    })
                    .then(post => {
                        //Check the post owner
                        if (post.user.toString() !== req.user.id) {
                            return res.status(401).json({
                                success: false,
                                reason: "User not authorized"
                            });
                        }
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
            });
    } else res.status(400).json({
        success: false,
        reason: "Bad url",
        moreDetailed: "please retype url, or check if the link you used was broken"
    });
});


// @route POST api/posts/comment/:id
// @desc Add comment to post
// @access Privte Route

router.post('/comment/:id', (req, res) => {
    if (validate(req.params.id)) {
        const {
            errors,
            isValid
        } = apr(req.body);
        if (!req.body.sev || !isValid || !req.files) {
            return res.status(400).json(errors);
        }
        Post.findOne({
            tagid: req.params.id
        }).then(post => {
            let image = req.files.img;
            const name = uuidv1() + "." + image.name.split(".")[1];
            image.mv('./temp/' + name);
            const newComment = {
                img: name,
                text: req.body.text,
                sev: req.body.sev //severity 0 to 2, 0 being green, 2 being red
            };

            // Add comment to the array
            post.comments.unshift(newComment);
            post.dateLastAccessed=Date.now;
            //save
            post.save().then(post => res.json(post)).catch((e) => console.error(e));
        }).catch(err => console.log(err));
    } else res.status(400).json({
        success: false,
        reason: "Bad url",
        moreDetailed: "please retype url, or check if the link you used was broken"
    });
});

// @route DELETE api/posts/comment/:id/:comment_id
// @desc DELETE a comment
// @access Private route

router.delete('/comment/:id/:comment_id', passport.authenticate('jwt', {
    session: false
}), (req, res) => {
    if (validate(req.params.id)) {
        Post.findOne({
            tagid: req.params.id
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
    } else res.status(400).json({
        success: false,
        reason: "Bad url",
        moreDetailed: "please retype url, or check if the link you used was broken"
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
        const tl = await Post.find({ user: req.user.internalId });
        console.log(tl);
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
    //res.redirect("https://"+req.headers.host+"/pdf/" + fn + ".pdf");

});

module.exports = router;