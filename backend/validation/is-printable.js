const Validator = require('validator');
const isEmpty = require('./is-empty');

module.exports = function validatePostInput(data) {
    let errors = {};
    if (Validator.isEmpty(data.tagSet)) {
        errors.text = 'Missing pre-computed QR codes';
    }
    if (Validator.isEmpty(data.printIteration)) {
        errors.text = 'Missing print iteration header';
    }
    if (data.tagSet.length != data.printIteration.length) {
        errors.text = "Print iteration header must be same length as QR code list";
    }
    return {
        errors,
        isValid: isEmpty(errors)
    };
};