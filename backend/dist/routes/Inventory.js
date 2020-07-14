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
const Inventory_1 = __importDefault(require("../models/Inventory"));
const User_1 = __importDefault(require("../models/User"));
const Item_1 = __importDefault(require("../models/Item"));
let router = express_1.Router();
router.get('/test', (req, res) => res.send("Inventory Works"));
router.post('/getall', helpers_1.default.passport, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    Inventory_1.default.getall(req.user._id, req.body.showDead)
        .then(out => res.json(helpers_1.default.scadd(out)))
        .catch(e => res.json(helpers_1.default.erep(e)));
}));
router.get('/getone/:id', helpers_1.default.passport, (req, res) => {
    Inventory_1.default.get(req.params.id)
        .then(out => res.json(helpers_1.default.scadd(out)))
        .catch(e => res.json(helpers_1.default.erep(e)));
});
router.get('/exists/:id', (req, res) => {
    Inventory_1.default.exists({
        _id: new helpers_1.default.toObjID(req.params.id)
    })
        .then((out) => res.json({ success: out }))
        .catch(e => res.json(helpers_1.default.erep(e)));
});
router.post('/new', helpers_1.default.passport, (req, res) => {
    User_1.default.findOne({
        _id: req.user._id
    })
        .then((usr) => Inventory_1.default.new(req.body.name, usr))
        .then(() => res.json(helpers_1.default.blankres))
        .catch(e => res.json(helpers_1.default.erep(e)));
});
router.post('/edit/:id', helpers_1.default.passport, (req, res) => {
    Inventory_1.default.updateOne({
        _id: new helpers_1.default.toObjID(req.params.id)
    }, req.body)
        .then(() => res.json(helpers_1.default.blankres))
        .catch(e => res.json(helpers_1.default.erep(e)));
});
router.delete('/delete/:id', helpers_1.default.passport, (req, res) => {
    User_1.default.findOne({
        _id: req.user._id
    })
        .then((usr) => Inventory_1.default.removal(new helpers_1.default.toObjID(req.params.id), usr))
        .then(() => res.json(helpers_1.default.blankres))
        .catch(e => res.json(helpers_1.default.erep(e)));
});
router.post('/newItem/:id', (req, res) => {
    Inventory_1.default.findById(req.params.id)
        .then((inv) => Item_1.default.new(inv, {
        name: req.body.name,
        inventory: inv._id,
        maxQuant: req.body.maxQuant,
        minQuant: req.body.minQuant,
        curQuant: req.body.curQuant,
        ip: req.ip
    }))
        .then(() => res.json(helpers_1.default.blankres))
        .catch(e => res.json(helpers_1.default.erep(e)));
});
router.delete('/delItem/:id/:item_id', (req, res) => {
    Item_1.default.mark({
        inventory: new helpers_1.default.toObjID(req.params.id),
        _id: new helpers_1.default.toObjID(req.params.item_id),
    }, true, req.ip).then(() => res.json(helpers_1.default.blankres))
        .catch(e => res.json(helpers_1.default.erep(e)));
});
router.post('/restore/:id/:item_id', (req, res) => {
    Item_1.default.mark({
        inventory: new helpers_1.default.toObjID(req.params.id),
        _id: new helpers_1.default.toObjID(req.params.item_id),
    }, false, req.ip)
        .then(() => res.json(helpers_1.default.blankres))
        .catch(e => res.json(helpers_1.default.erep(e)));
});
router.post('/updItemQuant/:id/:item_id', (req, res) => {
    Item_1.default.change({
        inventory: new helpers_1.default.toObjID(req.params.id),
        _id: new helpers_1.default.toObjID(req.params.item_id)
    }, req.body, true)
        .then(() => res.json(helpers_1.default.blankres))
        .catch(e => res.json(helpers_1.default.erep(e)));
});
router.post('/changeItem/:id/:item_id', (req, res) => {
    Item_1.default.change({
        inventory: new helpers_1.default.toObjID(req.params.id),
        _id: new helpers_1.default.toObjID(req.params.item_id)
    }, req.body, false)
        .then(() => res.json(helpers_1.default.blankres))
        .catch(e => res.json(helpers_1.default.erep(e)));
});
exports.default = router;
