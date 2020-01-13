//load in libraries
const validate = require('uuid-validate');
const express = require('express');
const fs = require('fs');
const CronJob = require("cron").CronJob;
//load in express modules
const router = express.Router();
//load in mongoose templates
const User = require("../models/User");
const UserIndex = require("../models/UserIndex.js");
const tempDir = process.env.rootDir+'/temp/';
// ROUTE: GET /pdf/:uuid
// DESCRIPTION: retrieves and returns pdf from temp dir
// INPUT: uuid of choice pdf
router.get('/pdf/:uuid', (req, res) => {
    var uu = req.params.uuid;
    //checks if url is valid
    if (validate(uu.split(".")[0])) res.sendFile(tempDir + uu);
    else res.status(404).json({
        success: false,
        simple: "invalid url. url may be incorrectly typed, or file may no longer exist."
    });
});
// ROUTE: GET /img/:uuid
// DESCRIPTION: retrieves and returns image from temp dir
// INPUT: uuid and extenstion of choice image
router.get('/img/:uuid', (req, res) => {
    var uu = req.params.uuid;
    //checks if url is valid
    if (validate(uu.split(".")[0])) res.sendFile(tempDir + uu);
    else res.status(404).json({
        success: false,
        simple: "invalid url. url may be incorrectly typed, or file may no longer exist."
    });
});

// ROUTE: NONE
// DESCRIPTION: deletes unused tokens and pdfs over a week old from the server
// INPUT: NONE
const delExp = new CronJob("00 00 00 * * *", function () {
    console.log("Goodnight, time to delete some stuff! (-_-)ᶻᶻᶻᶻ");
    var d = new Date();
    d.setDate(d.getDate() - 7);
    UserIndex.find({
        isCritical: true,
        created_at: { $lt: d }
    }, function (err, list) {
        for (var i = 0; i < list.length; i++) {
            if (err) console.log(err);
            console.log(list[i]);
            User.findOneAndRemove({
                isVerified: false,
                _id: list[i]._userId
            });
            UserIndex.findOneAndRemove({
                isCritical: true,
                created_at: { $lt: d },
                _id: list[i]._userId
            });
        }
    });
    fs.readdir(tempDir, function (err, files) {
        files.forEach(function (file) {
            if (fs.statSync(tempDir + file).birthtime < d && file.split(".")[1] != "pathpreserve") {
                fs.unlinkSync(tempDir + file);
            }
        });
    });
});
//start cronjob

//exports current script as module
module.exports = router;