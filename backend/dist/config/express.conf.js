"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const config = __importStar(require("./keys.json"));
const express = __importStar(require("express"));
const mongoose_1 = __importDefault(require("mongoose"));
const helmet_1 = __importDefault(require("helmet"));
const body_parser_1 = __importDefault(require("body-parser"));
const cors_1 = __importDefault(require("cors"));
const User_1 = __importDefault(require("../routes/User"));
const Tag_1 = __importDefault(require("../routes/Tag"));
const Comment_1 = __importDefault(require("../routes/Comment"));
const Dash_1 = __importDefault(require("../routes/Dash"));
const Inventory_1 = __importDefault(require("../routes/Inventory"));
const helpers_1 = __importDefault(require("../helpers"));
const keys_json_1 = __importDefault(require("../config/keys.json"));
class ExpressConfiguration {
    constructor() {
        this.dbUrl = config.url;
        this.app = express.default();
        this.config();
        this.dbConnect();
    }
    dbConnect() {
        mongoose_1.default.connect(keys_json_1.default.url, {
            useNewUrlParser: true,
            useUnifiedTopology: true
        }).then(() => console.log('Mongodb Connected'))
            .catch(err => helpers_1.default.erep(err));
        mongoose_1.default.set('useFindAndModify', false);
        mongoose_1.default.connection.once("open", () => {
            this.gfs = new mongoose_1.default.mongo.GridFSBucket(mongoose_1.default.connection.db, {
                bucketName: "uploads"
            });
        });
    }
    config() {
        this.app.use(helmet_1.default());
        this.app.use(cors_1.default());
        this.app.use(body_parser_1.default.urlencoded({
            extended: false
        }));
        this.app.use(body_parser_1.default.json());
        this.app.set('trust proxy', true);
        this.app.use((req, res, next) => {
            res.header('Access-Control-Allow-Origin', '*');
            res.header('Access-Control-Allow-Methods', 'GET,POST,DELETE');
            res.header('Access-Control-Allow-Headers', 'Content-Type, authorization');
            next();
        });
        this.app.use('/user', User_1.default);
        this.app.use('/tag', Tag_1.default);
        this.app.use('/comment', Comment_1.default);
        this.app.use('/dash', Dash_1.default);
        this.app.use('/inventory', Inventory_1.default);
    }
}
exports.default = new ExpressConfiguration();
