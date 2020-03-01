//module import block
const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const passport = require('passport');
const cors = require('cors');
const fs = require('fs');
const CronJob = require("cron").CronJob;
const User = require("./models/User");
const UserIndex = require("./models/UserIndex.js");
const Tag = require("./models/Tag.js");
const Comment = require('./models/Comment.js');

//import keys and creds, exp envvars
const keys = require('./config/keys');
process.env.rootDir = __dirname;
process.env.topLevelDomain = "cleanconnect.jakesandbox.com";
process.env.domainPrefix = "https://";

process.env.mailCreds = [process.env.mailServer || keys.mailServer, process.env.mailPort || keys.mailPort, process.env.mailUser || keys.mailUser, process.env.mailPass || keys.mailPass];
//imports different router/handler files
const user = require('./routes/User.js');
const tag = require('./routes/Tag.js');
const comment = require('./routes/Comment.js');
const file = require('./routes/File.js');

//setup bodyparser and express
const app = express();
app.use(cors());
app.use(bodyParser.urlencoded({
    extended: false
}));
app.use(bodyParser.json());

// Connect to MongoDB
mongoose.connect(process.env.url || keys.url, { useNewUrlParser: true })
    .then(() => console.log('Mongodb Connected'))
    .catch(err => console.log(err));
//dodge deprication warnings
mongoose.set('useNewUrlParser', true)
    .set('useFindAndModify', false)
    .set('useCreateIndex', true);

//Passport Config
app.use(passport.initialize());
require('./config/passport')(passport);

//map router files to respective urls
app.use('/user', user);
app.use('/tag', tag);
app.use('/comment', comment);
app.use('/file', file);

//set port and listen on it 
const port = process.env.BEPORT || 5000;
app.listen(port, () => console.log(`Server running on port ${port}`));

// ROUTE: NONE
// DESCRIPTION: deletes unused tokens and pdfs over a week old from the server
// INPUT: NONE
const tempDir = __dirname + '/temp/';
const delExp = new CronJob("00 00 00 * * *", function() {
    console.log("Goodnight, time to delete some stuff! (-_-)ᶻᶻᶻᶻ");
    //older than one week block
    var d = new Date();
    d.setDate(d.getDate() - 7);
    UserIndex.find({
        isCritical: true,
        createdAt: { $lt: d }
    }, function(err, list) {
        for (var i = 0; i < list.length; i++) {
            if (err) console.log(err);
            console.log(list[i]);
            User.findOneAndRemove({
                isVerified: false,
                _id: list[i]._userId
            });
            UserIndex.findOneAndRemove({
                isCritical: true,
                createdAt: { $lt: d },
                _id: list[i]._userId
            });
        }
    });
    fs.readdir(tempDir, function(err, files) {
        files.forEach(function(file) {
            if (fs.statSync(tempDir + file).birthtime < d && file.split(".")[1] == "pdf") {
                fs.unlinkSync(tempDir + file);
            }
        });
    });
    //older than one month block
    d.setDate(d.getDate() - 23);
    //remove images connected to stale comments
    Comment.find({
        markedForDeletion: true,
        removedAt: { $lt: d }
    }).then(cmts => {
        if (cmts) {
            for (var n in cmts) {
                if (n.img) {
                    fs.unlinkSync(tempDir + n.img);
                }
            }
        }
    });
    //remove comments
    Comment.deleteMany({
        markedForDeletion: true,
        removedAt: { $lt: d }
    }).then(result => console.log(result)).catch(err => console.error(`Delete failed with error: ${err}`));
    //older than 2 months block
    d.setDate(d.getDate() - 30);
    Tag.find({
        markedForDeletion: true,
        removedAt: { $lt: d }
    }).then(tgs => {
        if (tgs) {
            for (var n in tgs) {
                Comment.find({
                    tag: n._id
                }).then(cmts => {
                    if (cmts) {
                        for (var z in cmts) {
                            if (z.img) {
                                fs.unlinkSync(tempDir + z.img);
                            }
                        }
                    }
                });
            }
            Comment.deleteMany({
                markedForDeletion: true,
                removedAt: { $lt: d }
            }).then(result => console.log(result)).catch(err => console.error(`Delete failed with error: ${err}`));
        }
    });
    Tag.deleteMany({
        markedForDeletion: true,
        removedAt: { $lt: d }
    }).then(result => console.log(result)).catch(err => console.error(`Delete failed with error: ${err}`));
}, null, true, 'America/New_York');

//start cronjob
delExp.start();