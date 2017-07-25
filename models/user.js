var mongoose = require('mongoose');
var mainConnection = require('./mainConnection');
var bcrypt = require('bcrypt-nodejs');
var Schema = mongoose.Schema;


//User Schema
var UserSchema = mongoose.Schema({
    firstName: {
        type: String
    },
    lastName: {
        type: String
    },
    fullName: {
        type: String
    },
    password: {
        type: String,
        required: true,
        bcrypt: true
    },
    email: {
        type: String,
        index: true,
        unique:true
    },
    joinDate: {
        type: Date,
        default: Date.now
    },
    scope: String,
    coachEmail: String,
   

});

var User = module.exports = mainConnection.model('User', UserSchema);

module.exports.createUser = function (newUser, callback) {

    bcrypt.genSalt(10, function (err, salt) {
        if (err) throw err;
        bcrypt.hash(newUser.password, salt, null, function (err, hash) {
            if (err) throw err;
            newUser.password = hash;
            newUser.save(callback);
        });
    });
};


module.exports.setPw = function (user, newPw, callback) {

    bcrypt.genSalt(10, function (err, salt) {
        if (err) throw err;
        bcrypt.hash(newPw, salt, null, function (err, hash) {
            if (err) throw err;
            user.password = hash;
            user.save(callback);
        });
    });
};


module.exports.removeUserByEmail = function (email, callback) {
    User.findOneAndRemove({ email: email }, callback);
};

module.exports.updateUsersByCoachEmail = function (coachEmail, callback) {
    User.update({ coachEmail: coachEmail },{ $set: { coachEmail: null }}, callback);
};
module.exports.removeUserById = function (id, callback) {
    User.findOneAndRemove({ _id: id }, callback);
};


module.exports.getAllCoaches = function(callback){
    User.find({scope: 'Coach'}, callback);
}

module.exports.getUserByUsername = function (username, callback) {
    User.findOne({ username: username }, callback);
};
module.exports.getUserByEmail = function (email, callback) {

    User.findOne({ email: email }, callback);

};
module.exports.getUserById = function (id, callback) {
    User.findOne({ _id: id }, callback);
};
module.exports.comparePasswords = function (candidatePassword, hashedPassword, callback) {
    bcrypt.compare(candidatePassword, hashedPassword, function (error, isMatch) {
        if (error) return callback(error);
        else {
            callback(null, isMatch);
        }
    });
};
