const Validator = require('validator');
const isEmpty = require('./is-empty');


module.exports = function validatePostInput(data) {
    let errors = {};
    //important about empty string.
    if (Validator.isEmpty(data.body.text)) {
        errors.text = 'problem is required';
    }
    if (data.body.text.indexOf([""])>-1) {
        errors.text = "Please don't swear";
    }
    return {
        errors,
        isValid: isEmpty(errors)
    };
};