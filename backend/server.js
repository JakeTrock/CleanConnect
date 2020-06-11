//module import block
const express = require('express'),
    app = express(),
    helmet = require('helmet'),
    mongoose = require('mongoose'),
    bodyParser = require('body-parser'),
    cors = require('cors'),
    fs = require('fs'),
    async = require('promise-async'),
        CronJob = require("cron").CronJob,
        braintree = require("braintree"),
        User = require("./models/User"),
        UserIndex = require("./models/UserIndex.js"),
        Comment = require('./models/Comment.js'),
        Tag = require("./models/Tag.js"),
        Inventory = require("./models/Inventory.js"),
        //import keys and creds, exp envvars
        keys = require('./config/keys'),
        //imports different router/handler files
        user = require('./routes/User.js'),
        tag = require('./routes/Tag.js'),
        comment = require('./routes/Comment.js'),
        dash = require('./routes/Dash.js'),
        file = require('./routes/File.js'),
        inventory = require('./routes/Inventory.js'),
        helpers = require('./helpers'),
        gateway = braintree.connect({
            environment: braintree.Environment.Sandbox,
            merchantId: keys.mid,
            publicKey: keys.pbk,
            privateKey: keys.prk,
        });
//setup bodyparser and express
process.env.rootDir = __dirname;

if (!keys.testing) {
    process.env.topLevelDomain = "cleanconnect.us";
    process.env.domainPrefix = "https://";
} else {
    process.env.topLevelDomain = "localhost:3000";
    process.env.domainPrefix = "http://";
}
process.env.NODE_ENV = (keys.testing) ? "development" : "production";
console.log(`THIS IS THE ${process.env.NODE_ENV} BUILD`);
app.use(helmet());
app.use(cors());
app.use(bodyParser.urlencoded({
    extended: false
}));
app.use(bodyParser.json());
app.set('trust proxy', true);

// Connect to MongoDB
mongoose.connect(keys.url, {
        useNewUrlParser: true,
        useUnifiedTopology: true
    })
    .then(() => console.log('Mongodb Connected'))
    .catch(err => helpers.erep(err));
//dodge deprication warnings
mongoose.set('useNewUrlParser', true)
    .set('useFindAndModify', false)
    .set('useCreateIndex', true);

//map router files to respective urls
app.use('/user', user);
app.use('/tag', tag);
app.use('/comment', comment);
app.use('/dash', dash);
app.use('/file', file);
app.use('/inventory', inventory);

//set port and listen on it 

app.listen(5000, () => console.log("Server running on port 5000"));

(async () => {
    fs.readFile(__dirname + "/config/template1.svg", (err, data) => {
        process.env.tagSVG = data.toString()
    });
    fs.readFile(__dirname + "/config/template2.svg", (err, data) => {
        process.env.invSVG = data.toString()
    });
})()

process
    .on('unhandledRejection', (reason, p) => {
        console.error(reason, 'Unhandled Rejection at Promise', p);
    })
    .on('uncaughtException', err => {
        console.error(err, 'Uncaught Exception thrown');
        process.exit(1);
    });

// ROUTE: NONE
// DESCRIPTION: deletes unused tokens and pdfs over a week old from the server
// INPUT: NONE
const tempDir = __dirname + '/temp/';
const delExp = new CronJob("00 00 00 * * *", function () {
        console.log("Goodnight, time to delete some stuff! (-_-)ᶻᶻᶻᶻ");
        async.parallel({
                //older than one week block
                oneWeek: callback => {
                    var d = new Date();
                    d.setDate(d.getDate() - 7);
                    UserIndex.listPrunable(d).then(list =>
                            async.each(list, (elem, callback) => {
                                User.findById(elem._userId).then(gateway.subscription.cancel(user.PayToken))
                                    .then(User.findOneAndRemove({
                                        _id: user._id,
                                    }))
                                    .then(UserIndex.deleteMany({
                                        _userId: user._id,
                                    }))
                                    .then(Tag.purge(user._id))
                                    .then(Inventory.purge(user._id))
                                    .catch(e => callback(helpers.erep(e)))
                                    .then(callback())
                            }))
                        .then(fs.readdir(tempDir))
                        .then(files => {
                            async.each(files, (file, callback) => {
                                if (fs.statSync(tempDir + file).birthtime < d && file.split(".")[1] === "pdf")
                                    fs.unlinkSync(tempDir + file)
                                    .catch(callback)
                                    .then(callback());
                            });
                        })
                        .then(callback(null, true))
                        .catch(e => callback(e, false));
                },
                //older than one month block
                oneMonth: callback => {
                    var d = new Date();
                    d.setDate(d.getDate() - 23);
                    //remove images connected to stale comments
                    Comment.find({
                            markedForDeletion: true,
                            removedAt: {
                                $lt: d
                            }
                        }).then(cmts => {
                            if (cmts)
                                async.each(cmts, (cmt, callback) => {
                                    if (cmt.img) {
                                        fs.unlinkSync(tempDir + cmt.img)
                                            .then(callback())
                                            .catch(callback);
                                    } else callback();
                                });
                        })
                        //remove comments
                        .then(Comment.deleteMany({
                            markedForDeletion: true,
                            removedAt: {
                                $lt: d
                            }
                        }))
                        .then(callback(null, true))
                        .catch(e => callback(e, false));
                }
            })
            .then(console.log)
            .catch(helpers.erep);
    },
    null, true, 'America/New_York');

//start cronjob
delExp.start();