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
// const Tag = require("./models/Tag.js");
const Comment = require('./models/Comment.js');

//import keys and creds, exp envvars
const keys = require('./config/keys');
process.env.rootDir = __dirname;
if (!keys.testing) {
    process.env.topLevelDomain = "cleanconnect.us";
    process.env.domainPrefix = "https://";
} else {
    process.env.topLevelDomain = "localhost:3000";
    process.env.domainPrefix = "http://";
}
process.env.testing = keys.testing;
//imports different router/handler files
const user = require('./routes/User.js');
const tag = require('./routes/Tag.js');
const comment = require('./routes/Comment.js');
const erep = require('./routes/erep.js');
const file = require('./routes/File.js');

//setup bodyparser and express
const app = express();
app.use(cors());
app.use(bodyParser.urlencoded({
    extended: false
}));
app.use(bodyParser.json());
app.set('trust proxy', true);

// Connect to MongoDB
mongoose.connect(process.env.url || keys.url, { useNewUrlParser: true })
    .then(() => console.log('Mongodb Connected'))
    .catch(err => erep(undefined, err, 555, "MONGO ERROR", ""));
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

app.listen(5000, () => console.log("Server running on port 5000"));

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
            for (var i = 0, len = list.length; i < len; i++) {
                if (err) erep(undefined, err, 111, "CRON ERROR", "");
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
                for (var n = 0, len = cmts.length; n < len; n++) {
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
        }).then(result => console.log(result)).catch(err => erep(undefined, err, 444, "EXPIRY DELETION ERROR", ""));
        //older than 2 months block
    },
    null, true, 'America/New_York');

//start cronjob
delExp.start();