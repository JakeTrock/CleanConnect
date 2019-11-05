const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const passport = require('passport');
const cors = require('cors');//maybe placebo


const user = require('./routes/User');
const tag = require('./routes/Tag');
const file = require('./File.js');

const keys = require('./config/keys');

const app = express();


app.use(cors());
// Body Parser middleware

app.use(bodyParser.urlencoded({
    extended: false
}));
app.use(bodyParser.json());

// Connect to MongoDB

mongoose
    .connect(keys.url)
    .then(() => console.log('Mongodb Connected'))
    .catch(err => console.log(err));
//Passport Middleware
app.use(passport.initialize());

//Passport Config
require('./config/passport')(passport);
//Use Routes

app.use('/user', user);
app.use('/tag', tag);
app.use('/file', file);

const port = process.env.PORT || 5000;

app.listen(port, () => console.log(`Server running on port ${port}`));
