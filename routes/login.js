var express = require('express');
var router = express.Router();
var User = require('../models/user');
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var scope = require('../config/config').scope;


router.get('/', function (req, res, next) {
    User.find({}, function (err, users) {
        if (!users || users.length == 0) { // create superuser
            res.render('register', {
                title: 'Administrator',
                isAdmin: true,
                error: req.flash('error')
            });
        } else {
            res.render('login', {
                title: 'Sign-in',
                error: req.flash('error')
            });
        }
    });
});

passport.serializeUser(function(user, done) {
    done(null, user.id);
});

passport.deserializeUser(function(id, done) {
    User.getUserById(id, function(err, user) {
        done(err, user);
    });
});

passport.use(new LocalStrategy({
        usernameField: 'loginEmail',
        passwordField: 'loginPassword'
    },
    function(email, password, done){
        User.getUserByEmail(email, function(error, user){
            if(error) return done(error);
            if(!user){
                console.log("User " + email + " not found.");
                return done(null, false, {message: "Invalid email."});
            }

            User.comparePasswords(password, user.password, function(err, isMatch){
                if(err) return done(err);
                if(isMatch){
                    delete user.password;
                    return done(null, user);
                }else{
                    //console.log("Invalid password.")
                    return done(null, false, {message: "Invalid password."});
                }
            });
        });
    }
));
router.post('/', passport.authenticate('local', { failureRedirect: '/login', failureFlash: true }), function (req, res) {
    if (req.user.scope != scope.Admin) {
        res.redirect('/coachCalender');
    } else {
        res.redirect('/home');
    }
});


router.post('/reset', function (req, res, next) {

    req.checkBody('email', 'Email field is required.').notEmpty();

    req.checkBody('resetFirstName', 'First Name field is required.').notEmpty();
    req.checkBody('resetLastName', 'Last Name field is required.').notEmpty();

    req.checkBody('email', 'An account with that e-mail does not exist.').isEmailRegistered(null, req.body.resetFirstName, req.body.resetLastName);

    req.checkBody('resetFirstName', 'First name of this account does not match.').isFirstNameMatch(req.body.email);
    req.checkBody('resetLastName', 'Last name of this account does not match.').isLastNameMatch(req.body.email);

    req.checkBody('newPassword', 'Password may not contain spaces.').hasNoWhiteSpace();

    //is proper length
    req.checkBody('newPassword', 'Password must be 6 - 50 characters long.').isLength({ min: 6, max: 50 });

    //matching passwords
    req.checkBody('newPassword2', 'Passwords do not match.').equals(req.body.newPassword);

    //is required
    req.checkBody('newPassword', 'Password field is required.').notEmpty();

    //Asynchronouse validation due to the availability checks having to query db
    req.asyncValidationErrors().then(function () {//No validation errors
        //Create User from register form values
        User.getUserByEmail(req.body.email, function (err, user) {
            User.setPw(user, req.body.newPassword, function (err) {
                if (err) {
                    return next(err);
                }
                res.redirect('/login');
            });

        });

    }).catch(function (errors) {//Registration has validation errors
        var errorMap = {};
        errors.forEach(function (error) {
            errorMap[error.param] = error.msg;
        });
        resetError = errorMap.resetFirstName || errorMap.resetLastName || errorMap.email || errorMap.newPassword || errorMap.newPassword2;
        res.render('login', {
            title: 'Reset',
            resetError: resetError,
            firstNameError: errorMap.resetFirstName,
            lastNameError: errorMap.resetLastName,
            emailError: errorMap.email,
            passwordError: errorMap.newPassword,
            password2Error: errorMap.newPassword2,

            resetFirstName: req.body.resetFirstName,
            resetLastName: req.body.resetLastName,
            newPassword: req.body.newPassword,
            newPassword2: req.body.newPassword2,
        });
    });
});

module.exports = router;
