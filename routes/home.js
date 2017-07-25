var express = require('express');
var router = express.Router();
var scope = require('../config/config').scope;

/* GET users listing. */
router.get('/', ensureAuthenticated, function (req, res, next) {
    delete req.session.returnTo;
    res.render('home', {
        title: 'Home',
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
module.exports = router;
