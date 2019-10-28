const Validator = require('validator');
const isEmpty = require('./is-empty');


module.exports = function validateProfileInput(data) {
    let errors = {};
    //important about empty string.
    data.handle = !isEmpty(data.handle) ? data.handle : '';

    if (!Validator.isLength(data.handle, {
            min: 2,
            max: 40
        })) {
        errors.handle = 'Name needs to be between 2 to 40 characters.'
    }
    if (Validator.isEmpty(data.handle)) {
        errors.handle = 'Name is required.';
    }
    return {
        errors,
        isValid: isEmpty(errors)
    };
};