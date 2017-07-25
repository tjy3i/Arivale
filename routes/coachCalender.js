var express = require('express');
var router = express.Router();
var scope = require('../config/config').scope;
var User = require('../models/user');
var Reservation = require('../models/reservation');

// Generic error handler used by all endpoints.
function handleError(res, reason, message, code) {
    res.status(code || 500).json({ "error": message });
}

function ensureAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
        return next();
    } else {
        res.redirect('/login');
    }
}

router.post('/', ensureAuthenticated, function (req, res, next) {
    User.getUserByEmail(req.user.email, function (err, client) {
        if (err)
            return next(err);
        client.coachEmail = req.body.coachEmail;
        client.save();
        res.redirect('/coachCalender');
    })
});

router.get('/', ensureAuthenticated, function (req, res, next) {
    if (req.user.scope == scope.Client && req.user.coachEmail == null) {
        User.getAllCoaches(function (err, coaches) {
            if (err)
                return next(err);
            res.render('coachCalender', {
                title: 'Coach Calender',
                assignCoach: true,
                coaches: coaches,
                error: req.flash('error')
            });
        })
    }
    else {
        res.render('coachCalender', {
            title: 'Coach Calender',
            assignCoach: false,
            error: req.flash('error')
        });
    }

});


router.get('/eventsByCoach', ensureAuthenticated, function (req, res, next) {
    var email = null;
    if(req.user.scope == scope.Client){
        email = req.user.coachEmail;
    } else if(req.user.scope == scope.Coach){
        email = req.user.email;
    }
    if(email == null) 
        handleError(res,"Wrong permission","Sorry, current user do not have permission to view the calendar.", 400)
    
    Reservation.getReservationsByCoach(email, function (err, reservations) {
        if (err)
            return next(err);
        res.status(200).send({
            code: 200,
            success: true,
            events: reservations,
            user: req.user
        });
    });
});

router.post('/addEvent', ensureAuthenticated, function (req, res, next) {

    Reservation.createReservation(req.user.email, req.user.coachEmail, req.body.time, function (err, event) {
        if (err)
            return next(err);
        res.status(200).send({
            code: 200,
            success: true,
            event: event
        });
    })
});

router.post('/removeEvent', ensureAuthenticated, function (req, res, next) {
    Reservation.removeReservationById(req.body.eventId, function (err, event) {
        if (err)
            return next(err);
        res.status(200).send({
            code: 200,
            success: true,
            event: event
        });
    })
});

module.exports = router;