const swear = require('./swearWord').list;
const Validator = require('validator');
const isEmpty = require('./is-empty');


module.exports = function validatePostInput(data) {
    let errors = {};
    //important about empty string.
    if (Validator.isEmpty(data.text)) {
        errors.text = 'problem is required';
    }
    if (swear.indexOf(data.text.toLowerCase())>-1) {
        errors.text = "You'll have to clean up your language before we clean up this room.";
    }
    return {
        errors,
        isValid: isEmpty(errors)
    };
};