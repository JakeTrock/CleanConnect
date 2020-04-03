module.exports = function erep(res, err, scode, msg, repID) {
    const Tag = require('../models/Error.js');
    new Tag({
        ID: repID,
        message: msg,
        errorcode: scode,
        user: JSON.stringify(err)
    }).save((err) => { if (err) console.error(err) });
    if (res != undefined)
        return res.status(scode).json({
            success: false,
            simple: msg,
            details: err
        });
}