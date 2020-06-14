//import all libs
const express = require('express'),
    fileUpload = require('express-fileupload'),
    helpers = require('../helpers'),
    //model import
    Inventory = require('../models/Inventory'),
    User = require("../models/User"),
    Item = require("../models/Item"),
    //configure express addons
    router = express.Router();
//document settings and blank template image for pdf creator
router.use(fileUpload());

// ROUTE: GET inventory/test
// DESCRIPTION: Tests post route
router.get('/test', (req, res) => res.send("Inventory Works"));

// ROUTE: GET inventory/getall
// DESCRIPTION: Gets full inventory listings
router.post('/getall', helpers.passport, async (req, res) => {
    Inventory.getall(req.user._id, req.body.showDead)
        .then(
            out => res.json(helpers.scadd(out)),
            e => res.json(helpers.erep(e))
        );
});
// ROUTE: GET inventory/getone/id
// DESCRIPTION: gets the metadata of a single tag based on its id, can also be used to confirm if a tag exists
router.get('/getone/:id', helpers.passport, (req, res) => {
    Inventory.get(req.params.id)
        .then(
            out => res.json(helpers.scadd(out)),
            e => res.json(helpers.erep(e))
        );
});
// ROUTE: GET inventory/exists/:id
// DESCRIPTION: sees if tag exists
router.get('/exists/:id', (req, res) => {
    Inventory.get(req.params.id).then(
        res.json(helpers.scadd()),
        e => res.json(helpers.erep(e))
    );
});
// ROUTE: POST inventory/new
// DESCRIPTION: creates a new tag
// INPUT: requires a user name to link back to, and a unique room name
router.post('/new', helpers.passport, (req, res) => {
    User.findOne({
            _id: req.user._id
        })
        .then(usr => Inventory.new(req.body.name, usr))
        .then(
            res.send(helpers.scadd()),
            e => res.json(helpers.erep(e))
        );
});

// ROUTE: POST inventory/edit/:id
// DESCRIPTION: allows user to change current tag name to unique name
// INPUT: new tag name via json body
router.post('/edit/:id', helpers.passport, (req, res) => {
    Inventory.update(req.params.id, req.body)
        .then(
            res.json(helpers.scadd()),
            e => res.json(helpers.erep(e))
        );
});

// ROUTE: DELETE inventory/:id
// DESCRIPTION: allows user to delete given tag information
// INPUT: tag id via url bar

router.delete('/delete/:id', helpers.passport, (req, res) => {
    User.findOne({
            _id: req.user._id
        })
        .then(usr => Inventory.remove(req.params.id, usr))
        .then(
            res.send(helpers.scadd()),
            e => res.json(helpers.erep(e))
        );
});


router.post('/newItem/:id', (req, res) => {
    Inventory.findById(req.params.id)
        .then(inv => Item.new(inv, {
            name: req.body.name,
            inventory: inv._id,
            maxQuant: req.body.maxQuant,
            minQuant: req.body.minQuant,
            curQuant: req.body.curQuant,
            ip: req.ip
        }))
        .then(
            res.send(helpers.scadd()),
            e => res.json(helpers.erep(e))
        );
});

router.delete('/delItem/:id/:item_id', (req, res) => {
    Item.mark({
            inventory: req.params.id,
            _id: req.params.item_id,
        },
        true,
        req.ip
    ).then(
        res.json(helpers.scadd()),
        e => res.json(helpers.erep(e))
    );
});

router.post('/restore/:id/:item_id', (req, res) => {
    Item.mark({
            inventory: req.params.id,
            _id: req.params.item_id,
        },
        false,
        false
    ).then(
        res.json(helpers.scadd()),
        e => res.json(helpers.erep(e))
    );
});

router.post('/updItemQuant/:id/:item_id', (req, res) => {
    Item.update({
        inventory: req.params.id,
        _id: req.params.item_id,
    }, req.body,true).then(
        res.json(helpers.scadd()),
        e => res.json(helpers.erep(e))
    );
});

router.post('/changeItem/:id/:item_id', (req, res) => {
    Item.update({
        inventory: req.params.id,
        _id: req.params.item_id,
    }, req.body,false).then(
        res.json(helpers.scadd()),
        e => res.json(helpers.erep(e))
    );
});
//export module for importing into central server file
module.exports = router;