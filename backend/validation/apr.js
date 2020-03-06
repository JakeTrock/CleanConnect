// const swear = require('./swearWord').list;
const Validator = require('validator');
const isEmpty = require('./is-empty');
var cuss = require('cuss');

module.exports = function validatePostInput(data) {
    let errors = {};
    let instr = data.text.toLowerCase().split(" ");
    if (Validator.isEmpty(data.text)) {
        errors.text = 'problem is required';
    }
    for (var b in instr)
        if (cuss[instr[b]] == 2)
            errors.text = "You'll have to clean up your language before we clean up this room.";
    return {
        errors,
        isValid: isEmpty(errors)
    };
};