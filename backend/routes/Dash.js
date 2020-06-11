const express = require('express'),
    PDFDocument = require('pdfkit'),
    SVGtoPDF = require('svg-to-pdfkit'),
    randomBytes = require("randombytes"),
    fs = require('fs'),
    helpers = require('../helpers'),

    //model import
    async = require("promise-async"),
        User = require("../models/User"),
        Tag = require('../models/Tag'),
        Inventory = require("../models/Inventory"),
        //configure express addons
        router = express.Router(),
        //document settings and blank template image for pdf creator
        docsettings = [{
            size: 'LETTER'
        }];

// ROUTE: GET dash/:id
// DESCRIPTION: anonymous dashboard only accessible with secret keystring
router.get('/:dash', async (req, res) => {
    User.findOne({
        dashCode: req.params.dash
    }).then(user => {
        async.parallel({
                tags: (callback) =>
                    Tag.getall(user._id, false)
                    .then(out => callback(null, out))
                    .catch(err => callback(err, null)),
                inventories: (callback) =>
                    Inventory.getall(user._id, false)
                    .then(out => callback(null, out))
                    .catch(err => callback(err, null))
            })
            .then(out => res.json(helpers.scadd(out)))
            .catch(err => res.json(helpers.erep(err)))
    })
});
module.exports = router;