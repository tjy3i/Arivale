var mongoose = require( 'mongoose' );
var config = require('../config/config');
var async = require('async');

// Build the connection string

var mainConnectionUri = config.dbProperties.local.mainConnectionUri;

mongoose.Promise = global.Promise;

// Create the database connection
module.exports = mainConnection = mongoose.createConnection(mainConnectionUri);

// CONNECTION EVENTS
// When successfully connected
mainConnection.on('connected', function () {
    console.log('Mongoose default connection open to ' + mainConnectionUri);
});

// If the connection throws an error
mainConnection.on('error',function (err) {
    console.log('Mongoose default connection error: ' + err);
});

// When the connection is disconnected
mainConnection.on('disconnected', function () {
    console.log('Mongoose default connection disconnected');
});

// If the Node process ends, close the Mongoose connections
process.on('SIGINT', function() {
    async.parallel([
        function(callback) {
            mainConnection.close(function(){
                console.log('Mongoose main connection disconnected through app termination.');
                callback(null, 'mainConnection');
            })
        }
    ], function(err, results){
         process.exit(0);
    })
});