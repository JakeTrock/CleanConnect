const express = require('express'),
    passport = require('passport'),
    PDFDocument = require('pdfkit'),
    SVGtoPDF = require('svg-to-pdfkit'),
    randomBytes = require("randombytes"),
    fs = require('fs'),
    erep = require("./erep.js"),
    //model import
    Inventory = require('../models/Inventory'),
    Comment = require('../models/Comment'),
    User = require("../models/User"),
    Tag = require('../models/Tag'),
    Item = require("../models/Item"),
    //configure express addons
    router = express.Router(),
    //document settings and blank template image for pdf creator
    docsettings = [{ size: 'LETTER' }];

// ROUTE: GET dash/:id
// DESCRIPTION: anonymous dashboard only accessible with secret keystring
router.get('/:dash', async(req, res) => {
    var outnode = {};
    await User.findOne({
        dashCode: req.params.dash
    }).then(async user => {
        await Tag.find({
            user: user._userId
        }).then(async posts => {
            if (!posts) erep(res, "", 404, "No Tags found", req.ip);
            for (var n in posts) {
                await Comment.find({
                    tag: posts[n]._id,
                    markedForDeletion: false
                }).then(cmts => {
                    if (cmts)
                        for (var z in cmts) posts[n].comments.push(cmts[z]);
                });
            }
            await Inventory.find({
                user: user._userId
            }).then(async invs => {
                if (invs) {
                    for (var n = 0, len = invs.length; n < len; n++) {
                        await Item.find({
                            inventory: invs[n]._id,
                            markedForDeletion: req.body.showDead
                        }).then(cmts => {
                            if (cmts)
                                for (var z = 0, ln = cmts.length; z < ln; z++)
                                    invs[n].items.push(cmts[z]);
                        });
                    }
                    if (!invs) return erep(res, "", 404, "No Inventory found", req.ip);
                    else outnode.inventory = invs;
                    outnode.tags = invs;
                    res.json(outnode);
                }
            }).catch(err => erep(res, err, 404, "No Inventory found", req.ip));
        }).catch(err => erep(res, err, 404, "No Tags found", req.ip));
    }).catch(err => erep(res, err, 404, "No User found", req.ip));
});

// ROUTE: GET mgmt/print
// DESCRIPTION: prints big qr poster for employees to use
// INPUT: number of pages to print
router.post('/print/', passport.authenticate('jwt', {
    session: false
}), (req, res) => {
    User.findOne({
        _id: req.user._id
    }, function(err, udata) {
        if (err || udata == undefined) return erep(res, err, 500, "Error generating pdf", req.user._id);
        fs.readFile(__dirname + '/template2.svg', function(err, data) {
            if (err) return erep(res, err, 500, "Error generating pdf", req.user._id);
            //svg template file
            var svgbuff = data.toString();
            const doc = new PDFDocument(docsettings);
            const fn = randomBytes(16).toString("hex");
            doc.pipe(fs.createWriteStream(process.env.rootDir + '/temp/' + fn + '.pdf'));
            svgbuff = svgbuff.replace("imgins", udata.dashUrl);
            for (var n = 0, len = req.body.printIteration; n < len; n++) SVGtoPDF(doc, svgbuff, 0, 0);
            //finish writing to document
            doc.end();
            //redirect user to pdf page
            res.json({
                success: true,
                filename: fn
            });
        });
    });
});

module.exports = router;