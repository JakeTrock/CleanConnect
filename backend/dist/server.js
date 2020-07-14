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
const express_conf_1 = __importDefault(require("./config/express.conf"));
const schedule = __importStar(require("node-schedule"));
const braintree_1 = __importDefault(require("braintree"));
const asyncpromise_1 = __importDefault(require("./asyncpromise"));
const User_1 = __importDefault(require("./models/User"));
const UserIndex_1 = __importDefault(require("./models/UserIndex"));
const Comment_1 = __importDefault(require("./models/Comment"));
const Tag_1 = __importDefault(require("./models/Tag"));
const Inventory_1 = __importDefault(require("./models/Inventory"));
const helpers_1 = __importDefault(require("./helpers"));
const keys_json_1 = __importDefault(require("./config/keys.json"));
const util_1 = require("util");
const gateway = braintree_1.default.connect({
    environment: braintree_1.default.Environment.Sandbox,
    merchantId: keys_json_1.default.mid,
    publicKey: keys_json_1.default.pbk,
    privateKey: keys_json_1.default.prk,
});
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
express_conf_1.default.app.listen(5000, () => console.log("Server running on port 5000"));
process
    .on('unhandledRejection', (reason, p) => helpers_1.default.erep(`${reason} Unhandled Rejection at Promise ${util_1.inspect(p)}`))
    .on('uncaughtException', err => {
    helpers_1.default.erep(`Uncaught Exception thrown ${util_1.inspect(err)}`);
    process.exit(1);
});
schedule.scheduleJob("00 00 00 * * *", () => {
    console.log("Goodnight, time to delete some stuff! (-_-)ᶻᶻᶻᶻ");
    asyncpromise_1.default.parallel({
        oneWeek: (callback) => {
            var d = new Date();
            d.setDate(d.getDate() - 7);
            UserIndex_1.default.listPrunable(d).then((list) => asyncpromise_1.default.each(list, (elem, callback) => {
                User_1.default.findById(elem._userId).then(user => asyncpromise_1.default.parallel({
                    payCancel: gateway.subscription.cancel(user.PayToken),
                    userRemove: User_1.default.findOneAndRemove({
                        _id: user._id,
                    }),
                    indexRemove: UserIndex_1.default.deleteMany({
                        _userId: user._id,
                    }),
                    tagPurge: Tag_1.default.purge(user._id),
                    invPurge: Inventory_1.default.purge(user._id)
                }))
                    .catch(e => callback(e))
                    .then(callback());
            }))
                .then(callback(null, true))
                .catch(e => callback(e, false));
        },
        oneMonth: callback => {
            var d = new Date();
            d.setDate(d.getDate() - 23);
            Comment_1.default.find({
                markedForDeletion: true,
                removedAt: {
                    $lt: d
                }
            }).then((list) => asyncpromise_1.default.each(list, (elem, callback) => {
                Comment_1.default.rmImageDelete(elem._id)
                    .catch(e => callback(e))
                    .then(callback());
            }))
                .then(callback(null, true))
                .catch(e => callback(e, false));
        }
    }).then(console.log)
        .catch(helpers_1.default.erep);
});
