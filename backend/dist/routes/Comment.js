"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const xss_filters_1 = __importDefault(require("xss-filters"));
const helpers_1 = __importDefault(require("../helpers"));
const Comment_1 = __importDefault(require("../models/Comment"));
const Tag_1 = __importDefault(require("../models/Tag"));
const express_conf_1 = __importDefault(require("../config/express.conf"));
const Image_1 = __importDefault(require("../models/Image"));
let router = express_1.Router();
router.get("/test", (req, res) => res.send("Comments Works"));
router.get('/img/:id', (req, res) => {
    express_conf_1.default.gfs.openDownloadStream(new helpers_1.default.toObjID(req.params.id)).pipe(res);
});
router.post("/new/:id", Image_1.default.single('img'), (req, res) => {
    Tag_1.default.get(req.params.id)
        .then((tag) => {
        Comment_1.default.new({
            ip: req.ip,
            tag: new helpers_1.default.toObjID(req.params.id),
            text: xss_filters_1.default.uriInHTMLData(req.body.text),
            img: (req.file) ? req.file.id : undefined,
            sev: req.body.sev,
        }, tag)
            .then(() => res.json(helpers_1.default.blankres))
            .catch(e => res.json(helpers_1.default.erep(e)));
    });
});
router.delete("/delete/:id/:comment_id", (req, res) => {
    Comment_1.default.mark({
        tag: new helpers_1.default.toObjID(req.params.id),
        _id: new helpers_1.default.toObjID(req.params.comment_id),
    }, true, req.ip)
        .then(() => res.json(helpers_1.default.blankres))
        .catch(e => res.json(helpers_1.default.erep(e)));
});
router.post("/restore/:id/:comment_id", (req, res) => {
    Comment_1.default.mark({
        tag: new helpers_1.default.toObjID(req.params.id),
        _id: new helpers_1.default.toObjID(req.params.comment_id),
    }, false, req.ip)
        .then(() => res.json(helpers_1.default.blankres))
        .catch(e => res.json(helpers_1.default.erep(e)));
});
exports.default = router;
