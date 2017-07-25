/**
 * Helpers
 */
var hbs = require('hbs');
var helpers = {

    /**
     * If word1 exists in array, returns true
     */
    'ifMatch': function (word1, word2, options) {
        var wordsMatch = false;
        if (word1 == word2) {
            wordsMatch = true;
        }

        return wordsMatch ? options.fn(this) : options.inverse(this);
    },
    'unlessMatch': function (word1, word2, options) {
        var wordsMatch = false;
            if (word1 == word2) {
                wordsMatch = true;
            }
        return wordsMatch ? options.inverse(this) : options.fn(this);
    },
};

module.exports = {
    initializeHelpers: function () {
        for (var helper in helpers) {
            hbs.registerHelper(helper, helpers[helper]);
        }
    }
};


