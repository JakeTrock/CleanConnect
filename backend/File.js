//load in libraries
const validate = require('uuid-validate');
const express = require('express');
const fs = require('fs');
const CronJob = require("cron").CronJob;
//load in express modules
const router = express.Router();
//load in mongoose templates
const User = require("./models/User");
const UserIndex = require("./models/UserIndex");

// ROUTE: GET /pdf/:uuid
// DESCRIPTION: retrieves and returns pdf from temp dir
// INPUT: uuid of choice pdf
router.get('/pdf/:uuid', (req, res) => {
    var uu = req.params.uuid;
    //checks if url is valid
    if (validate(uu.split(".")[0])) res.sendFile(__dirname + '/temp/' + uu);
    else res.status(404).json({
        error: "invalid url. please retype url correctly."
        // error: "This pdf has been deleted to preserve the privacy of its user, or never existed in the first place. Pdf files are erased from the server one week after their creation, if you'd like to re-generate this pdf, please go to https://CleanConnect.com/user/print"
    });
});
// ROUTE: GET /img/:uuid
// DESCRIPTION: retrieves and returns image from temp dir
// INPUT: uuid and extenstion of choice image
router.get('/img/:uuid', (req, res) => {
    var uu = req.params.uuid;
    //checks if url is valid
    if (validate(uu.split(".")[0])) res.sendFile(__dirname + '/temp/' + uu);
    else res.status(404).json({
        error: "invalid url. please retype url correctly."
        //error: "This image has been deleted to preserve the privacy of its user, or never existed in the first place. Image files are erased from the server when no longer needed."
    });
});

// ROUTE: NONE
// DESCRIPTION: deletes unused tokens and pdfs over a week old from the server
// INPUT: NONE
const tempDir = __dirname + '/temp/';
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
    //--experimental--
    fs.readdir(tempDir, function (err, files) {
        files.forEach(function (file) {
            if (fs.statSync(tempDir + file).birthtime < d&&file.split(".")[1]!="pathpreserve") {
                fs.unlinkSync(tempDir + file);
            }
        });
    });
    //--experimental--
});
//start cronjob

//exports current script as module
module.exports = router;