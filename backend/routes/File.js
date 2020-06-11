//load in libraries
const express = require('express'),
    helpers = require('../helpers'),
    //load in express modules
    router = express.Router(),
    //load in mongoose templates

    tempDir = require('path').resolve(__dirname, '../temp/');
// ROUTE: GET /img/:url
// DESCRIPTION: retrieves and returns image from temp dir
// INPUT: url and extenstion of choice image
router.get('/img/:url', (req, res) => {
    const uu = req.params.url;
    //checks if url is valid
    if (uu.split(".")[0].length == 32) res.sendFile(tempDir + "/" + uu);
    else res.json({
        err: "invalid url. url may be incorrectly typed, or file may no longer exist"
    });
});
//exports current script as module
module.exports = router;