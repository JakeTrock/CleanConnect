const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const passport = require('passport');
const validate = require('uuid-validate');
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
router.get('/test', (req, res) => res.json({
    msg: "Tag Works"
}));
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

// @route GET api/posts/:id
// @desc Get all the post
// @access Public
router.get('/:id', (req, res) => {
    if (validate(req.params.id)) {
        Post.findOne({
                tagid: req.params.id
            })
            .then(post => {
                if (!post) {
                    res.status(404).json({
                        success: false,
                        error: "Room not found(maybe it was deleted?).",
                        moreDetailed: "404 room not found"
                    });
                }
                res.json(post);
            }).catch(err => res.status(404).json({
                success: false,
                reason: "Room not found(maybe it was deleted?).",
                moreDetailed: err
            }));
    } else {
        res.status(404).json({
            success: false,
            reason: "Room not found(maybe it was deleted?).",
            moreDetailed: err
        });
    }
});


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
    newPost.save().then(post => res.json(post));
});

// @route DELETE api/post/:id
// @desc DELETE a post by its id
// @access Private route

router.delete('/:id', passport.authenticate('jwt', {
    session: false
}), (req, res) => {
    //current user
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
                    post.remove().then(() => res.json({
                        success: true
                    }));
                })
                .catch(err => res.status(404).json({
                    success: false,
                    reason: "Post not found",
                    moreDetailed: err
                }));
        });

});


// @route POST api/posts/comment/:id
// @desc Add comment to post
// @access Privte Route

router.post('/comment/:id', (req, res) => {
    // const {
    //     errors,
    //     isValid
    // } = apr(req.body.text);
    // if (!req.body.sev || !isValid) {
    //     return res.status(400).json(errors);
    // }
    Post.findOne({
        tagid: req.params.id
    }).then(post => {
        const newComment = {
            img: req.files.img,//need to fix '<p>Image: <input type="file" name="image" /></p>'
            text: req.body.text,
            sev: req.body.sev //severity 0 to 2, 0 being green, 2 being red
        };

        // Add comment to the array
        post.comments.unshift(newComment);

        //save
        post.save().then(post => res.json(post))
    }).catch(err => console.log(err));
});

// @route DELETE api/posts/comment/:id/:comment_id
// @desc DELETE a comment
// @access Private route

router.delete('/comment/:id/:comment_id', passport.authenticate('jwt', {
    session: false
}), (req, res) => {
    Post.findOne({
        tagid: req.params.id
    }).then(post => {
        // Check if the comment exists
        if (post.comments.filter(comment => comment._id.toString() === req.params.comment_id).length === 0) {
            return res.status(404).json({
                commentnotfound: "Your comment doesn't exist"
            })
        }
        // Get remove index

        const removeIndex = post.comments
            .map(item => item._id.toString())
            .indexOf(req.params.comment_id);

        // Splice comment out of the array
        post.comments.splice(removeIndex, 1);

        post.save().then(res.json(post));
    }).catch(err => res.status(404).json({
        postnotfound: "Post not found!!"
    }));
});

router.get('/comment/:id/:comment_id', passport.authenticate('jwt', {
    session: false
}), (req, res) => {
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
        res.json(post.comments.filter(comment => comment._id.toString() === req.params.comment_id));
    }).catch(err => res.status(404).json({
        postnotfound: "Post not found!!"
    }));
});

module.exports = router;