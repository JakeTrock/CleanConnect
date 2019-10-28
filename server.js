const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const passport = require('passport');

const users = require('./routes/api/users');
const profile = require('./routes/api/profile');
const tag = require('./routes/api/tag');
const keys = require('./config/keys');
const router = express.Router();


const app = express();

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

app.use('/user', users);
app.use('/profile', profile);
app.use('/tag', tag);

const port = process.env.PORT || 5000;

app.listen(port, () => console.log(`Server running on port ${port}`));
