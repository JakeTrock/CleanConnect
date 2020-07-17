"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const helpers_1 = __importDefault(require("../helpers"));
const User_1 = __importDefault(require("../models/User"));
const Tag_1 = __importDefault(require("../models/Tag"));
let router = express_1.Router();
router.get("/test", (req, res) => res.send("Tag Works"));
router.post("/new", helpers_1.default.passport, (req, res) => {
    User_1.default.findById(req.user._id)
        .then((usr) => Tag_1.default.new(req.body.name, usr))
        .then(() => res.json(helpers_1.default.blankres))
        .catch(e => res.json(helpers_1.default.erep(e)));
});
router.post("/getall", helpers_1.default.passport, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    Tag_1.default.getall(req.user._id, req.body.showDead)
        .then(out => res.json(helpers_1.default.scadd({ tags: out })))
        .catch(e => res.json(helpers_1.default.erep(e)));
}));
router.get("/getone/:id", helpers_1.default.passport, (req, res) => {
    Tag_1.default.get(req.params.id)
        .then((out) => res.json(helpers_1.default.scadd(out)))
        .catch(e => res.json(helpers_1.default.erep(e)));
});
router.get("/exists/:id", (req, res) => {
    Tag_1.default.exists(new helpers_1.default.toObjID(req.params.id))
        .then((out) => res.json({ success: out }))
        .catch(e => res.json(helpers_1.default.erep(e)));
});
router.post("/edit/:id", helpers_1.default.passport, (req, res) => {
    Tag_1.default.change(new helpers_1.default.toObjID(req.params.id), req.body)
        .then(() => res.json(helpers_1.default.blankres))
        .catch(e => res.json(helpers_1.default.erep(e)));
});
router.delete("/delete/:id", helpers_1.default.passport, (req, res) => {
    User_1.default.findById(req.user._id)
        .then((usr) => Tag_1.default.removal(new helpers_1.default.toObjID(req.params.id), usr._id))
        .then(() => res.json(helpers_1.default.blankres))
        .catch(e => res.json(helpers_1.default.erep(e)));
});
exports.default = router;
