const JwtStrategy = require('passport-jwt').Strategy;
const ExtractJwt = require('passport-jwt').ExtractJwt;
const mongoose = require('mongoose');
const User = mongoose.model('User');
const keys = require('./keys');
const erep = require('./routes/erep.js');

const opts = {};
//get jwt token from authorization header
opts.jwtFromRequest = ExtractJwt.fromAuthHeaderAsBearerToken();
opts.secretOrKey = process.env.secretOrKey || keys.secretOrKey;
module.exports = passport => {
    passport.use(new JwtStrategy(opts, (jwt_payload, done) => {
        User.findById(jwt_payload._id)
            .then(user => {
                if (user) {
                    return done(null, user);
                }
                return done(null, false);
            }).catch(err => erep(undefined, err, 222, "PASSPORT ERROR", ""));
    }));
}