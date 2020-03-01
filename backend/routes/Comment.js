//import all libs
const express = require('express');
const fileUpload = require('express-fileupload');
const randomBytes = require("randombytes");
//model import
const Tag = require('../models/Tag.js');
const Comment = require('../models/Comment.js');
// Validation Part for input
const apr = require('../validation/apr.js');
//configure express addons
const router = express.Router();
router.use(fileUpload());


// ROUTE: POST tag/comment/:id
// DESCRIPTION: allows unauthorized user to add a comment to a post
// INPUT: severity of issue(0 to 2, being worst), description of issue, and an optional image of the issue

router.post('/new/:id', (req, res) => {
    const {
        errors,
        isValid
    } = apr(req.body);
    if (!req.body.sev || !isValid) {
        return res.status(400).json({
            success: false,
            simple: "Invalid post body.",
            details: errors
        });
    }
    Tag.findOne({
        _id: req.params.id
    }).then(post => {
        var comment;
        if (req.files) {
            let image = req.files.img;
            if (image.size < 5100000 && (image.mimetype == "video/mp4" || image.mimetype == "video/webm" || image.mimetype == "image/webp" || image.mimetype == "image/gif" || image.mimetype == "image/jpeg" || image.mimetype == "image/png" || image.mimetype == "image/jpg" || image.mimetype == "image/tiff")) {
                const name = randomBytes(16).toString("hex") + "." + image.name.split(".")[image.name.length - 1];
                image.mv('./temp/' + name);
                comment = {
                    tag: req.params.id,
                    img: name,
                    text: req.body.text,
                    sev: req.body.sev //severity 0 to 2, 0 being green, 2 being red
                };
            } else {
                return res.status(400).json({
                    tag: req.params.id,
                    success: false,
                    simple: "invalid filetype",
                });
            }
        } else {
            comment = {
                tag: req.params.id,
                text: req.body.text,
                sev: req.body.sev //severity 0 to 2, 0 being green, 2 being red
            };
        }
        // Add comment to the array
        try {
            post.dateLastAccessed = new Date();
            new Comment(comment).save();
            post.save();
            res.json({
                success: true
            })
        } catch (e) {
            res.status(500).json({
                success: false,
                simple: "Error creating tag.",
                details: e
            })
        }
    });
});

// ROUTE: DELETE api/posts/comment/:id/:comment
// DESCRIPTION: allows deletion of comment, most likely after it has been resolved
// INPUT: in the url bar, this first takes the id of the post, then the id of the child comment

router.delete('/delete/:id/:comment_id', (req, res) => {
    Comment.findOne({
        tag: req.params.id,
        _id: req.params.comment_id
    }).then(post => {
        // Check if the comment exists
        if (!post) {
            return res.status(404).json({
                success: false,
                simple: "Your comment doesn't exist"
            });
        }
        post.markedForDeletion = true;
        post.removedAt = new Date();
        post.save().then(res.json({
            success: true
        })).catch((e) => res.json({
            success: false,
            simple: "Error saving comment.",
            details: e
        }));
    }).catch(err => res.status(404).json({
        success: false,
        simple: "Comment not found.",
        details: err
    }));
});

// ROUTE: POST api/posts/comment/:id/:comment
// DESCRIPTION: allows restoration of comment, after it has been wrongfully deleted
// INPUT: in the url bar, this first takes the id of the post, then the id of the child comment

router.post('/restore/:id/:comment_id', (req, res) => {
    Comment.findOne({
        tag: req.params.id,
        _id: req.params.comment_id
    }).then(post => {
        // Check if the comment exists
        if (!post) {
            return res.status(404).json({
                success: false,
                simple: "Your comment doesn't exist"
            });
        }
        post.markedForDeletion = false;
        post.removedAt = null;
        post.save().then(res.json({
            success: true
        })).catch((e) => res.json({
            success: false,
            simple: "Error saving comment.",
            details: e
        }));
    }).catch(err => res.status(404).json({
        success: false,
        simple: "Comment not found.",
        details: err
    }));
});

//export module for importing into central server file
module.exports = router;