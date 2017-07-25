var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var expressValidator = require('express-validator');
var hbs = require('hbs');

var coachCalender = require('./routes/coachCalender');
var userSettings = require('./routes/userSettings')
var home = require('./routes/home');
var register = require('./routes/register');
var logout = require('./routes/logout');
var login = require('./routes/login');
var coach = require('./routes/coach');
var flash = require('connect-flash');
var session = require('express-session');
var passport = require('passport');

var app = express();
var server = require('http').Server(app);


// view engine setup
hbs.localsAsTemplateData(app);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');
hbs.registerPartials(__dirname + '/views/partials');

app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(expressValidator());
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

//Handle Express Sessions
app.use(session({
  secret: 'ArivaleCalls',
  saveUninitialized: true,
  resave: true
}));

//Passport
app.use(passport.initialize());
app.use(passport.session());

//Validator
var User = require('./models/user');
// In this example, the formParam value is going to get morphed into form body format useful for printing.
app.use(expressValidator({
  customValidators: {
    canEmailRegister: function (email) {
      if (email == "" || !email)
        return true; //empty email is handled by isEmpty validator so we let it pass this test to not override that error
      return new Promise(function (resolve, reject) {
        User.getUserByEmail(email, function (err, user) {
          if (user) {
            reject("Account with this e-mail already exists and is verified.");
          }
          else {
            resolve();
          }
        });
      });
    },


    isEmailRegistered: function (email) {
      if (email == "" || !email)
        return true; //empty email is handled by isEmpty validator so we let it pass this test to not override that error
      return new Promise(function (resolve, reject) {
        User.getUserByEmail(email, function (err, user) {
          if (user) {
            resolve(); //user exists
          } else {
            //user doesn't exist
            reject("Account with this e-mail does not exist.");
          }
        });
      });
    },

    isFirstNameMatch: function (firstName, email) {
      if (email == "" || !email)
        return true; //empty email is handled by isEmpty validator so we let it pass this test to not override that error
      return new Promise(function (resolve, reject) {
        User.getUserByEmail(email, function (err, user) {
          if (user) {
            if (user.firstName == firstName) {
              resolve(); //user exists
            } else
              reject("First name of this account does not match.");
          } else {
            return true;
          }
        });
      });
    },

    isLastNameMatch: function (lastName, email) {
      if (email == "" || !email)
        return true; //empty email is handled by isEmpty validator so we let it pass this test to not override that error
      return new Promise(function (resolve, reject) {
        User.getUserByEmail(email, function (err, user) {
          if (user) {
            if (user.lastName == lastName) {
              resolve(); //user exists
            } else
              reject("First name of this account does not match.");
          } else {
            return true;
          }
        });
      });
    },

    hasNoWhiteSpace: function (string) {
      return !(/\s/g.test(string));
    },
    isexpDateFormattedCorrectly: function (e) {
      console.log(isNaN(e.charAt(0)));

      if (e.charAt(2) == '/' && !isNaN(e.charAt(0)) && !isNaN(e.charAt(1)) && !isNaN(e.charAt(3)) && !isNaN(e.charAt(4)) && e.length == 5) {
        return true;
      }
      return false;
    },
    hasLetter: function (string) {
      // check for characters between a and z
      // i flag makes it case insensitive
      return /[a-z]/i.test(string);
    }
  },
  errorFormatter: function (param, msg, value) {
    var namespace = param.split('.')
      , root = namespace.shift()
      , formParam = root;

    while (namespace.length) {
      formParam += '[' + namespace.shift() + ']';
    }
    return {
      param: formParam,
      msg: msg,
      value: value
    };
  }
}));


//Make user available to all views, in handlebars view object will be 'user'
app.get('*', function (req, res, next) {

  res.locals.user = req.user || null;
  next();
});

//Flash
app.use(flash());
app.use(function (req, res, next) {
  res.locals.messages = require('express-messages')(req, res);
  next();
});

app.use('/', coachCalender);
app.use('/userSettings', userSettings);
app.use('/register', register);
app.use('/logout', logout);
app.use('/coachCalender', coachCalender);
app.use('/login', login);
app.use('/home', home);
app.use('/coach', coach);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

/**
 * Helpers
 */
var helpers = require('./helpers/helpers');
helpers.initializeHelpers();

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use(function (err, req, res, next) {
    res.status(err.status || 500);
    //    console.log(err);
    res.render('error', {
      message: err.message,
      error: err
    });
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function (err, req, res, next) {
  res.status(err.status || 500);
  // console.log(err);
  res.render('error', {
    message: err.message,
    error: {}
  });
});

module.exports = { app: app, server: server, };
