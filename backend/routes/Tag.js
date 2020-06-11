//import all libs
const express = require("express"),
    fileUpload = require("express-fileupload"),
    helpers = require('../helpers'),
    PDFDocument = require("pdfkit"),
    SVGtoPDF = require("svg-to-pdfkit"),
    randomBytes = require("randombytes"),
    fs = require("fs"),
    //model import
    Tag = require("../models/Tag.js"),
    User = require("../models/User"),
    // Validation Part for input
    //configure express addons
    router = express.Router(),
    //document settings and blank template image for pdf creator
    docsettings = [{
        size: "LETTER"
    }];
router.use(fileUpload());

// ROUTE: GET tag/test
// DESCRIPTION: Tests post route
router.get("/test", (req, res) => res.send("Tag Works"));

// ROUTE: POST tag/new
// DESCRIPTION: creates a new tag
// INPUT: requires a user name to link back to, and a unique room name
router.post("/new", helpers.passport, (req, res) => {
    User.findOne({
            _id: req.user._id
        })
        .then(usr => Tag.new(req.body.name, usr))
        .then(
            res.send(helpers.scadd()),
            e => res.json(helpers.erep(e))
        );
});

// ROUTE: GET tag/getall
// DESCRIPTION: pregenerates qr codes, skipping tags that are already generated
router.post("/getall", helpers.passport, async (req, res) => {
    Tag.getall(req.user._id, req.body.showDead)
        .then(
            out => res.json(helpers.scadd(out)),
            e => res.json(helpers.erep(e))
        );
});

// ROUTE: GET tag/getone/id
// DESCRIPTION: gets the metadata of a single tag based on its id, can also be used to confirm if a tag exists
router.get("/getone/:id", helpers.passport, (req, res) => {
    Tag.get(req.params.id).then(
        out => res.json(helpers.scadd(out)),
        e => res.json(helpers.erep(e))
    );
});

// ROUTE: GET tag/exists/:id
// DESCRIPTION: sees if tag exists
router.get("/exists/:id", (req, res) => {
    Tag.get(req.params.id).then(
        res.json(helpers.scadd()),
        e => res.json(helpers.erep(e))
    );
});


// ROUTE: POST tag/edit/:id
// DESCRIPTION: allows user to change current tag name to unique name
// INPUT: new tag name via json body
router.post("/edit/:id", helpers.passport, (req, res) => {
    Tag.update(req.params.id, req.body).then(
        res.json(helpers.scadd()),
        e => res.json(helpers.erep(e))
    );
});

// ROUTE: DELETE tag/:id
// DESCRIPTION: allows user to delete given tag information
// INPUT: tag id via url bar

router.delete("/delete/:id", helpers.passport, (req, res) => {
    User.findById(req.user._id)
        .then(usr => Tag.remove(req.params.id, usr))
        .then(
            res.send(helpers.scadd()),
            e => res.json(helpers.erep(e))
        );
});
//export module for importing into central server file
module.exports = router;