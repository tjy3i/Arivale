var express = require('express');
var router = express.Router();
var User = require('../models/user');
var scope = require('../config/config').scope;

router.get('/',  function (req, res, next) {
    res.render('register', {
        title: 'Register',
        error: req.flash('error')
    });
});


function ensureAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
        if (req.user.scope != scope.Admin) {
            res.redirect('/login');
        } else {
            return next();
        }

    } else {
        res.redirect('/login');
    }
}

router.post('/', function (req, res, next) {

    //Form validation
    //is valid email
    req.checkBody('registerEmail', 'Email not valid.').isEmail();

    //is proper format
    req.checkBody('registerFirstName', 'First name must only contain letters.').isAlpha();
    req.checkBody('registerLastName', 'Last name must only contain letters.').isAlpha();

    //no whitespace
    req.checkBody('registerPassword', 'Password may not contain spaces.').hasNoWhiteSpace();

    //is proper length
    req.checkBody('registerFirstName', 'First Name may have up to 20 characters.').isLength({ max: 20 });
    req.checkBody('registerLastName', 'Last Name may have up to 20 characters.').isLength({ max: 20 });
    req.checkBody('registerPassword', 'Password must be 6 - 50 characters long.').isLength({ min: 6, max: 50 });

    //is available
    req.checkBody('registerEmail', 'An account with that e-mail already exists.').canEmailRegister();

    //matching passwords
    req.checkBody('registerPassword2', 'Passwords do not match.').equals(req.body.registerPassword);

    //is required
    req.checkBody('registerFirstName', 'First Name field is required.').notEmpty();
    req.checkBody('registerLastName', 'Last Name field is required.').notEmpty();
    req.checkBody('registerEmail', 'Email field is required.').notEmpty();
    req.checkBody('registerPassword', 'Password field is required.').notEmpty();


    //Check for errors
    //Asynchronouse validation due to the availability checks having to query db
    req.asyncValidationErrors().then(function () {//No validation errors
        //Create User from register form values

        var newUser = new User({
            firstName: req.body.registerFirstName,
            lastName: req.body.registerLastName,
            fullName: req.body.registerFirstName + " " + req.body.registerLastName,
            email: req.body.registerEmail,
            password: req.body.registerPassword,
            scope: req.body.registerAdmin ? scope.Admin : (req.user && req.user.scope == scope.Admin ? scope.Coach : scope.Client),

        });

        User.createUser(newUser, function (error, user) {
            if (error) throw error;
            res.redirect(req.session.returnTo || '/coachCalender');

        });
    }).catch(function (errors) {//Registration has validation errors
        var errorMap = {};
        errors.forEach(function (error) {
            errorMap[error.param] = error.msg;
        });

        var registerError = errorMap.registerFirstName || errorMap.registerLastName || errorMap.registerLastName ||
            errorMap.registerEmail || errorMap.registerPassword || errorMap.registerPassword2;

        res.render('register', {
            title: 'Register',
            registerError: registerError,
            firstNameError: errorMap.registerFirstName,
            lastNameError: errorMap.registerLastName,
            emailError: errorMap.registerEmail,
            passwordError: errorMap.registerPassword,
            password2Error: errorMap.registerPassword2,
            registerFirstName: req.body.registerFirstName,
            registerLastName: req.body.registerLastName,
            registerEmail: req.body.registerEmail,
            registerPassword: req.body.registerPassword,
            registerPassword2: req.body.registerPassword2,
            isAdmin: req.body.registerAdmin,
            user: req.user
        });
    });

});

module.exports = router;
