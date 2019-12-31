//module import block
const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const passport = require('passport');
const cors = require('cors');

//imports different router/handler files
const user = require('./routes/User.js');
const tag = require('./routes/Tag.js');
const file = require('./File.js');
const keys = require('./config/keys');

//setup bodyparser and express
const app = express();
app.use(cors());
app.use(bodyParser.urlencoded({
    extended: false
}));
app.use(bodyParser.json());

// Connect to MongoDB
mongoose.connect(keys.url, { useNewUrlParser: true })
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
const port = process.env.PORT || 5000;
app.listen(port, () => console.log(`Server running on port ${port}`));