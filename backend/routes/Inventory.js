//import all libs
const express = require('express'),
    fileUpload = require('express-fileupload'),
    passport = require('passport'),
    erep = require("./erep.js"),
    keys = require('../config/keys'),
    //model import
    Inventory = require('../models/Inventory'),
    User = require("../models/User"),
    Item = require("../models/Item"),
    // Validation Part for input
    validatePostInput = require('../validation/tag.js'),
    QRCode = require('qrcode'),
    //configure express addons
    router = express.Router();
//document settings and blank template image for pdf creator
router.use(fileUpload());

// ROUTE: GET inventory/test
// DESCRIPTION: Tests post route
router.get('/test', (req, res) => res.send("Inventory Works"));

// ROUTE: GET inventory/getall
// DESCRIPTION: Gets full inventory listings
router.post('/getall', passport.authenticate('jwt', {
    session: false
}), async(req, res) => {
    await Inventory.find({
        user: req.user._id
    }).then(async posts => {
        if (posts) {
            for (var n = 0, len = posts.length; n < len; n++) {
                await Item.find({
                    inventory: posts[n]._id,
                    markedForDeletion: req.body.showDead
                }).then(cmts => {
                    if (cmts)
                        for (var z = 0, ln = cmts.length; z < ln; z++)
                            posts[n].items.push(cmts[z]);
                });
            }
            res.json(posts);
        }
    }).catch(err => erep(res, err, 404, "No posts found", req.user._id));
});
// ROUTE: GET inventory/getone/id
// DESCRIPTION: gets the metadata of a single tag based on its id, can also be used to confirm if a tag exists
router.get('/getone/:id', passport.authenticate('jwt', {
    session: false
}), (req, res) => {
    Inventory.findOne({
        _id: req.params.id
    }).then(post => res.json(post)).catch(err => erep(res, err, 404, "no inventories found", req.user._id));
});
// ROUTE: GET inventory/exists/:id
// DESCRIPTION: sees if tag exists
router.get('/exists/:id', (req, res) => {
    Inventory.findOne({
        _id: req.params.id
    }).then(post => res.json({ exists: (post != null) })).catch(err => erep(res, err, 404, "no inventories found", req.user._id));
});
// ROUTE: POST inventory/new
// DESCRIPTION: creates a new tag
// INPUT: requires a user name to link back to, and a unique room name
router.post('/new', passport.authenticate('jwt', {
    session: false
}), (req, res) => {
    User.findOne({ _id: req.user._id }).then(usr => {
        if (usr.numInv + 1 > keys.invCeilings[usr.tier]) return erep(res, "", 400, "No more inventories can be created with your current plan, please consider upgrading", req.user._id);
        // add tag node
        const {
            errors,
            isValid
        } = validatePostInput(req);
        if (!isValid) return erep(res, errors, 400, "Invalid post body", req.user._id);
        Inventory.find({
            user: req.user._id,
            name: req.body.name
        }).then(posts => {
            if (posts[0] != null) return erep(res, "", 400, "Name not unique", req.user._id);
            User.findOneAndUpdate({
                _id: req.user._id
            }, {
                $inc: { numInv: 1 }
            }).then(() => {
                new Inventory({
                    name: req.body.name,
                    user: req.user._id
                }).save((err, obj) => {
                    if (err) return erep(res, err, 500, "Error creating inventory", req.user._id);
                    QRCode.toDataURL(process.env.domainPrefix + process.env.topLevelDomain + '/dash/inventory/' + obj._id, function(err, url) {
                        Inventory.findOneAndUpdate({
                            name: req.body.name,
                            user: req.user._id
                        }, {
                            $set: { qrcode: url }
                        }, {
                            new: true
                        }).then(res.json({
                            success: true
                        }));
                    })
                });
            });
        });
    });
});

// ROUTE: POST inventory/edit/:id
// DESCRIPTION: allows user to change current tag name to unique name
// INPUT: new tag name via json body
router.post('/edit/:id', passport.authenticate('jwt', {
    session: false
}), (req, res) => {
    //edit tag node
    const {
        errors,
        isValid
    } = validatePostInput(req);
    if (!isValid) return erep(res, errors, 400, "Invalid post body.", req.user._id);
    Inventory.find({
        user: req.user._id,
        name: req.body.name
    }).then(posts => {
        if (posts[0] != null) return erep(res, "", 400, "Name not unique", req.user._id);
        Inventory.findOneAndUpdate({
                _id: req.params.id,
                user: req.user._id.toString()
            }, {
                $set: { name: req.body.name }
            }, {
                new: true
            }).then(res.json({ success: true }))
            .catch(e => erep(res, e, 500, "Error updating tag", req.user._id));
    });
});

// ROUTE: DELETE inventory/:id
// DESCRIPTION: allows user to delete given tag information
// INPUT: tag id via url bar

router.delete('/delete/:id', passport.authenticate('jwt', {
    session: false
}), (req, res) => {
    Inventory.deleteOne({
        _id: req.params.id,
        user: req.user.id
    }).then(() => {
        User.findOneAndUpdate({
            _id: req.user._id
        }, {
            $inc: { numInv: -1 }
        }).catch(err => erep(res, err, 404, "User not found", req.user._id)).then(() => res.json({
            success: true
        }));
    }).catch(err => erep(res, err, 404, "Tag not found", req.user._id));
});


router.post('/newItem/:id', (req, res) => {
    Item.find({ inventory: req.params.id, name: req.body.name }).then(inv => {
        if (inv[0] != null) return erep(res, "", 400, "Item already exists", req.ip)
        new Item({
            name: req.body.name,
            inventory: req.params.id,
            maxQuant: req.body.maxQuant || undefined,
            minQuant: req.body.minQuant || 0,
            curQuant: req.body.curQuant || 0,
            ip: req.ip
        }).save(
            Inventory.findOneAndUpdate({ _id: req.params.id }, {
                $set: { date: new Date() }
            }).exec(function(e, doc) {
                if (e)
                    erep(res, e, 500, "Unable to add item", req.ip);
                else
                    res.json({ success: true })
            }));
    });
});

router.delete('/delItem/:id/:item_id', (req, res) => {
    Item.findOneAndUpdate({
        inventory: req.params.id,
        _id: req.params.item_id
    }, {
        $set: {
            markedForDeletion: true,
            removedAt: new Date(),
            deletedBy: req.ip
        }
    }).then(res.json({
        success: true
    })).catch((e) => erep(res, e, 500, "Error marking for removal", req.params.item_id));
});

router.post('/restore/:id/:item_id', (req, res) => {
    Item.findOneAndUpdate({
        inventory: req.params.id,
        _id: req.params.item_id
    }, {
        $set: {
            markedForDeletion: false,
            removedAt: null,
        }
    }).then(res.json({
        success: true
    })).catch((e) => erep(res, e, 500, "Error restoring item", req.params.item_id));
});

router.post('/updItemQuant/:id/:item_id', (req, res) => {
    Item.findOneAndUpdate({
        inventory: req.params.id,
        _id: req.params.item_id
    }, {
        $set: {
            curQuant: req.body.newVal
        }
    }).then(res.json({
        success: true
    })).catch((e) => erep(res, e, 500, "Error updating item", req.params.item_id));
});



router.post('/changeItem/:id/:item_id', (req, res) => {
    var fields = req.body;
    fields.date = new Date();
    // if (req.body.name) fields.name = req.body.name;
    // if (req.body.maxQuant) fields['items.$.maxQuant'] = req.body.maxQuant;
    // if (req.body.minQuant) fields['items.$.minQuant'] = req.body.minQuant;
    Item.findOneAndUpdate({
        inventory: req.params.id,
        _id: req.params.item_id
    }, {
        $set: fields
    }).then(res.json({
        success: true
    })).catch((e) => erep(res, e, 500, "Error updating item", req.params.item_id));
});
//export module for importing into central server file
module.exports = router;