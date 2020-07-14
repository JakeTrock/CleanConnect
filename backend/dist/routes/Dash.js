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
const asyncpromise_1 = __importDefault(require("../asyncpromise"));
const User_1 = __importDefault(require("../models/User"));
const Tag_1 = __importDefault(require("../models/Tag"));
const Inventory_1 = __importDefault(require("../models/Inventory"));
let router = express_1.Router();
router.get('/:dash', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
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
}));
exports.default = router;
