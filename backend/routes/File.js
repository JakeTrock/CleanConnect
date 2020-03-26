//load in libraries
const express = require('express');
const erep = require("./erep.js");
//load in express modules
const router = express.Router();
//load in mongoose templates

const tempDir = process.env.rootDir + '/temp/';
// ROUTE: GET /pdf/:url
// DESCRIPTION: retrieves and returns pdf from temp dir
// INPUT: url of choice pdf
router.get('/pdf/:url', (req, res) => {
    var uu = req.params.url;
    //checks if url is valid
    if (uu.split(".")[0].length == 32) res.sendFile(tempDir + uu);
    else erep(res, "", 404, "invalid url. url may be incorrectly typed, or file may no longer exist", "");
});
// ROUTE: GET /img/:url
// DESCRIPTION: retrieves and returns image from temp dir
// INPUT: url and extenstion of choice image
router.get('/img/:url', (req, res) => {
    var uu = req.params.url;
    //checks if url is valid
    if (uu.split(".")[0].length == 32) res.sendFile(tempDir + uu);
    else erep(res, "", 404, "invalid url. url may be incorrectly typed, or file may no longer exist", "");
});
//exports current script as module
module.exports = router;