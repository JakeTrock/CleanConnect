const Validator = require('validator');
const isEmpty = require('./is-empty');

module.exports = function validatePostInput(data, pil) {
    let errors = {};
    if (!data.printIteration || data.printIteration.length < 1) {
        errors.text = 'Missing print iteration header';
    }
    if (data.printIteration.length != pil) {
        errors.text = 'printIteration header not short/long enough, should be of length ' + pil;
    }
    return {
        errors,
        isValid: isEmpty(errors)
    };
};