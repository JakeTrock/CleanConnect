const validate = require('uuid-validate');
const express = require('express');

const router = express.Router();

//seperate file routes
router.get('/pdf/:uuid', (req, res) => {
    var uu = req.params.uuid.split(".")[0];
    if (validate(uu)) res.sendFile(__dirname + '/temp/' + uu + '.pdf');
    else res.status(404).json({
        error: "This pdf has been deleted to preserve the privacy of its user, or never existed in the first place. Pdf files are erased from the server one week after their creation, if you'd like to re-generate this pdf, please go to https://CleanConnect.com/user/print"
    });
});
router.get('/img/:uuid', (req, res) => {
    if (validate(req.params.uuid.split(".")[0])) res.sendFile(__dirname + '/temp/' + req.params.uuid);
    else res.status(404).json({
        error: "This image has been deleted to preserve the privacy of its user, or never existed in the first place. Image files are erased from the server when no longer needed."
    });
});
module.exports = router;