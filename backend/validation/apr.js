// const swear = require('./swearWord').list;
const Validator = require('validator');
const isEmpty = require('./is-empty');
var cuss = require('cuss');

module.exports = function validatePostInput(data) {
    let errors = {};
    if (Validator.isEmpty(data.text)) {
        errors.text = 'problem is required';
    }
    let instr = data.text.toLowerCase().split(" ");
    for (var n = 0, len = instr.length; n < len; n++)
        if (cuss[instr[n]] == 2)
            errors.text = "You'll have to clean up your language before we clean up this room.";
    return {
        errors,
        isValid: isEmpty(errors)
    };
};