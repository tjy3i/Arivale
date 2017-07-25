var express = require('express');
var router = express.Router();
var User = require('../models/user');
var scope = require('../config/config').scope;
var Reservation = require('../models/reservation');

router.get('/', ensureAuthenticated, function (req, res, next) {
    req.session.returnTo = '/home';
    res.redirect('/register');
});

router.get('/remove', ensureAuthenticated, function (req, res, next) {
    User.getAllCoaches(function (err, coaches) {
        if (err)
            return next(err);
        res.render('coach', {
            title: 'Remove Coach',
            isRemove: true,
            coaches: coaches,
            error: req.flash('error')
        });
    })

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


router.post('/remove', ensureAuthenticated, function (req, res, next) {
    User.removeUserByEmail(req.body.coachEmail, function (error) {
        if (error) throw error;
        User.updateUsersByCoachEmail(req.body.coachEmail, function(error){
            if (error) throw error;
            Reservation.removeReservationByCoach(req.body.coachEmail, function(error){
                res.redirect('/home');
            });
        });
    });
});

module.exports = router;