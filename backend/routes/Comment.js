const express = require('express');
const fileUpload = require('express-fileupload');
const randomBytes = require("randombytes");
//model import
const Tag = require('../models/Tag.js');
const Comment = require('../models/Comment.js');
const erep = require("./erep.js");

// Validation Part for input
const apr = require('../validation/apr.js');
//configure express addons
const router = express.Router();
router.use(fileUpload());

// ROUTE: POST comment/test
// DESCRIPTION: tests comment route 
// INPUT: none
router.get('/test', (req, res) => res.send("Tag Works"));

// ROUTE: POST comment/:id
// DESCRIPTION: allows unauthorized user to add a comment to a post
// INPUT: severity of issue(0 to 2, being worst), description of issue, and an optional image of the issue

router.post('/new/:id', (req, res) => {
    const {
        errors,
        isValid
    } = apr(req.body);
    if (!req.body.sev || !isValid) return erep(res, errors, 400, "Invalid comment body", req.params.id);
    Tag.findOne({
        _id: req.params.id
    }).then(post => {
        var comment = {
            ip: req.ip,
            tag: req.params.id,
            text: req.body.text,
            sev: req.body.sev
        };
        if (req.files) {
            let image = req.files.img;
            if (image.size < 5100000 && (image.mimetype == "video/mp4" || image.mimetype == "video/webm" || image.mimetype == "image/webp" || image.mimetype == "image/gif" || image.mimetype == "image/jpeg" || image.mimetype == "image/png" || image.mimetype == "image/jpg" || image.mimetype == "image/tiff")) {
                const name = randomBytes(16).toString("hex") + "." + image.name.split(".")[image.name.split(".").length - 1];
                image.mv('./temp/' + name);
                comment = {
                    ip: req.ip,
                    tag: req.params.id,
                    img: name,
                    text: req.body.text,
                    sev: req.body.sev //severity 0 to 2, 0 being green, 2 being red
                };
            } else return erep(res, "", 400, "Invalid filetype(we allow png, jpg, jpeg, webp, gif, tiff, mp4 and webm uploads up to 5.1 MB)", req.params.id)
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
            erep(res, e, 500, "Error creating comment", req.params.id);
        }
    });
});

// ROUTE: DELETE api/posts/comment/:id/:comment
// DESCRIPTION: allows deletion of comment, most likely after it has been resolved
// INPUT: in the url bar, this first takes the id of the post, then the id of the child comment

router.delete('/delete/:id/:comment_id', (req, res) => {
    Comment.findOneAndUpdate({
        tag: req.params.id,
        _id: req.params.comment_id
    }, {
        $set: {
            markedForDeletion: true,
            removedAt: new Date(),
            deletedBy: req.ip
        }
    }).then(res.json({
        success: true
    })).catch((e) => erep(res, e, 500, "Error saving comment", req.params.comment_id));
});

// ROUTE: POST api/posts/comment/:id/:comment
// DESCRIPTION: allows restoration of comment, after it has been wrongfully deleted
// INPUT: in the url bar, this first takes the id of the post, then the id of the child comment

router.post('/restore/:id/:comment_id', (req, res) => {
    Comment.findOneAndUpdate({
        tag: req.params.id,
        _id: req.params.comment_id
    }, {
        $set: {
            markedForDeletion: false,
            removedAt: null,
        }
    }).then(res.json({
        success: true
    })).catch((e) => erep(res, e, 500, "Error saving comment", req.params.comment_id));
});

//export module for importing into central server file
module.exports = router;