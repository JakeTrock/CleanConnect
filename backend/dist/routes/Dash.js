"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const helpers_1 = __importDefault(require("../helpers"));
const asyncpromise_1 = __importDefault(require("../asyncpromise"));
const User_1 = __importDefault(require("../models/User"));
const Tag_1 = __importDefault(require("../models/Tag"));
const Inventory_1 = __importDefault(require("../models/Inventory"));
let router = express_1.Router();
router.get('/:dash', (req, res) => {
    User_1.default.findOne({
        dashCode: req.params.dash
    }).then((user) => {
        asyncpromise_1.default.parallel({
            tags: (callback) => Tag_1.default.getall(user._id, false)
                .then((out) => callback(null, out))
                .catch(err => callback(err, null)),
            inventories: (callback) => Inventory_1.default.getall(user._id, false)
                .then((out) => callback(null, out))
                .catch(err => callback(err, null))
        })
            .then(out => res.json(helpers_1.default.scadd(out)))
            .catch(e => res.json(helpers_1.default.erep(e)));
    });
});
exports.default = router;
