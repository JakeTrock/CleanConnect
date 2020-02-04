//module import block
const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const passport = require('passport');
const cors = require('cors');
//import keys and creds, exp envvars
const keys = require('./config/keys');
process.env.rootDir = __dirname;
process.env.mailCreds = [process.env.mailServer || keys.mailServer, process.env.mailPort || keys.mailPort, process.env.mailUser || keys.mailUser, process.env.mailPass || keys.mailPass];
//imports different router/handler files
const user = require('./routes/User.js');
const tag = require('./routes/Tag.js');
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
app.use('/file', file);

//set port and listen on it 
const port = process.env.BEPORT || 5000;
app.listen(port, () => console.log(`Server running on port ${port}`));



// var memwatch = require('node-memwatch');
// var hd = new memwatch.HeapDiff();
// memwatch.on('stats', function(stats) {
//     console.log(JSON.stringify(stats));
//     var diff = hd.end();
//     console.log(JSON.stringify(diff));
//     hd = new memwatch.HeapDiff();
// });
// memwatch.on('leak', function(info) {
//     console.log(JSON.stringify(info));
//     var diff = hd.end();
//     console.log(JSON.stringify(diff));
//     hd = new memwatch.HeapDiff();
// });