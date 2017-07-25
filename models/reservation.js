var mongoose = require('mongoose');
var mainConnection = require('./mainConnection');
var Schema = mongoose.Schema;


//Reservation Schema
var ReservationSchema = mongoose.Schema({
    coachEmail: String,
    clientEmail: String,
    time: {
        type: Date,
        default: Date.now
    }
});

var Reservation = module.exports = mainConnection.model('Reservation', ReservationSchema);

module.exports.createReservation = function (clientEmail, coachEmail,time, callback) {

    var reservation = new Reservation({
            coachEmail: coachEmail,
            clientEmail: clientEmail,
            time: time
        });
    reservation.save(callback);
};

module.exports.getReservationsByCoach = function (coachEmail, callback) {
    Reservation.find({ coachEmail: coachEmail }, callback);
};

module.exports.removeReservationById = function (id, callback) {
    Reservation.findOneAndRemove({ _id: id }, callback);
};

module.exports.removeReservationByCoach = function (coachEmail, callback) {
    Reservation.remove({ coachEmail: coachEmail }, callback);
};


