const express = require("express"),
    fileUpload = require("express-fileupload"),
    randomBytes = require("randombytes"),
    xss = require("xss"),
    //model import
    Comment = require("../models/Comment.js"),
    Tag = require("../models/Tag.js"),
    helpers = require('../helpers'),
    codecs = [
        "video/mp4",
        "video/webm",
        "image/webp",
        "image/gif",
        "image/jpeg",
        "image/png",
        "image/jpg",
        "image/tiff",
    ],
    // Validation Part for input
    //configure express addons
    router = express.Router();
router.use(fileUpload());

// ROUTE: POST comment/test
// DESCRIPTION: tests comment route
// INPUT: none
router.get("/test", (req, res) => res.send("Comments Works"));

// ROUTE: POST comment/:id
// DESCRIPTION: allows unauthorized user to add a comment to a post
// INPUT: severity of issue(0 to 2, being worst), description of issue, and an optional image of the issue

router.post("/new/:id", (req, res) => {
    Tag.get(req.params.id).then((tag) => {
        var comment = {
            ip: req.ip,
            tag: req.params.id,
            text: xss(req.body.text),
            sev: req.body.sev,
        };
        if (req.files) {
            let image = req.files.img;
            if (image.size < 5100000 && codecs.indexOf(image.mimetype) >= 0) {
                const name = randomBytes(16).toString("hex") + "." + image.name.split(".")[image.name.split(".").length - 1];
                image.mv("./temp/" + name);
                comment.img = name;
                Comment.new(comment, tag).then(
                    res.json(helpers.scadd()),
                    e => res.json(helpers.erep(e))
                );
            } else
                res.json({
                    err: "Invalid filetype(we allow png, jpg, jpeg, webp, gif, tiff, mp4 and webm uploads up to 5.1 MB)"
                })
        } else
            Comment.new(comment, tag)
            .then(
                res.json(helpers.scadd()),
                e => res.json(helpers.erep(e))
            );
    });
});

// ROUTE: DELETE api/posts/comment/:id/:comment
// DESCRIPTION: allows deletion of comment, most likely after it has been resolved
// INPUT: in the url bar, this first takes the id of the post, then the id of the child comment

router.delete("/delete/:id/:comment_id", (req, res) => {
    Comment.mark({
            tag: req.params.id,
            _id: req.params.comment_id,
        },
        true,
        req.ip
    ).then(
        res.json({
            success: true
        }),
        e => res.json(helpers.erep(e))
    );
});

// ROUTE: POST api/posts/comment/:id/:comment
// DESCRIPTION: allows restoration of comment, after it has been wrongfully deleted
// INPUT: in the url bar, this first takes the id of the post, then the id of the child comment

router.post("/restore/:id/:comment_id", (req, res) => {
    Comment.mark({
            tag: req.params.id,
            _id: req.params.comment_id,
        },
        false,
        false
    ).then(
        res.json({
            success: true
        }),
        e => res.json(helpers.erep(e))
    );
});

//export module for importing into central server file
module.exports = router;