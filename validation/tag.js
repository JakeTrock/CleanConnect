const Validator = require('validator');
const isEmpty = require('./is-empty');
const validate = require('uuid-validate');


module.exports = function validatePostInput(data) {
    let errors = {};
    //important about empty string.
    data.body.text = !isEmpty(data.body.text) ? data.body.text : '';
    if (Validator.isEmpty(data.body.name)) {
        errors.text = 'tagname is required';
    }
    return {
        errors,
        isValid: isEmpty(errors)
    };
};