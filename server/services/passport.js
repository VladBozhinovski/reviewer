const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const mongoose = require('mongoose');
const keys = require('../config/keys');

const User = mongoose.model('users');

passport.serializeUser((user, done) => {
    done(null, user.id); // user.id is a mongodb shortcut to the user (signed as $oid)
});

passport.deserializeUser((id, done) => {
    User.findById(id)
        .then(user => {
            done(null, user);
        });
});

passport.use(
    new GoogleStrategy({
            clientID: keys.googleClientID,
            clientSecret: keys.googleClientSecret,
            callbackURL: '/auth/google/callback',
            proxy: true
        },
        (accessToken, refreshToken, profile, done) => {
            User.findOne({
                    googleId: profile.id
                })
                .then((existingUser) => {
                    if (existingUser) {
                        // we already have a record with the given profile id
                        done(null, existingUser);
                    } else {
                        // we dont have user record with this user id and make record
                        new User({
                                googleId: profile.id
                            })
                            .save()
                            .then(user => done(null, user));
                    }
                })

        }));