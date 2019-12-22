const Validator = require('validator');
const isEmpty = require('./is-empty');

module.exports = function validatePostInput(data) {
    let errors = {};
    //important about empty string.
    if (Validator.isEmpty(data.body.name)) {
        errors.text = 'tagname is required';
    }
    return {
        errors,
        isValid: isEmpty(errors)
    };
};