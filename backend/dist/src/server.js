"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_conf_1 = __importDefault(require("./config/express.conf"));
const helpers_1 = __importDefault(require("./helpers"));
const keys_json_1 = __importDefault(require("./config/keys.json"));
const util_1 = require("util");
const serverless_http_1 = __importDefault(require("serverless-http"));
if (!keys_json_1.default.testing) {
    process.env.topLevelDomain = "cleanconnect.us";
    process.env.domainPrefix = "https://";
}
else {
    process.env.topLevelDomain = "localhost:3000";
    process.env.domainPrefix = "http://";
}
process.env.NODE_ENV = (keys_json_1.default.testing) ? "development" : "production";
console.log(`THIS IS THE ${process.env.NODE_ENV} BUILD`);
module.exports.handler = serverless_http_1.default(express_conf_1.default.app);
process
    .on('unhandledRejection', (reason, p) => helpers_1.default.erep(`${reason} Unhandled Rejection at Promise ${util_1.inspect(p)}`))
    .on('uncaughtException', err => {
    helpers_1.default.erep(`Uncaught Exception thrown ${util_1.inspect(err)}`);
    process.exit(1);
});
