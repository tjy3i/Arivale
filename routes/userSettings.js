var express = require('express');
var router = express.Router();
var User = require('../models/user');
var scope = require('../config/config').scope;

router.get('/', ensureAuthenticated, function (req, res, next) {
    res.render('userSettings', {
        title: 'User Settings',
        error: req.flash('error')
    });

});
// Generic error handler used by all endpoints.
function handleError(res, reason, message, code) {
    res.status(code || 500).json({ "error": message });
}

function ensureAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
        return next();
    }
    res.redirect('/login');
};


router.post('/', ensureAuthenticated, function (req, res, next) {

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

        User.setPw(req.user, req.body.newPassword, function (err) {
            if (err) {
                return next(err);
            }
            if (req.user.scope == scope.Admin) {
                res.redirect(req.session.returnTo ||'/home');
            } else {
                res.redirect(req.session.returnTo || '/coachCalender');
            }
            delete req.session.returnTo;
        });

    }).catch(function (errors) {//Registration has validation errors
        var errorMap = {};
        errors.forEach(function (error) {
            errorMap[error.param] = error.msg;
        });


        res.render('userSettings', {
            title: 'User Settings',
            passwordError: errorMap.newPassword,
            password2Error: errorMap.newPassword2,

            newPassword: req.body.newPassword,
            newPassword2: req.body.newPassword2,
            user: req.user
        });
    });


});

module.exports = router;
