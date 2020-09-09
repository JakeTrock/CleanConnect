"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const async_1 = __importDefault(require("async"));
const pify_1 = __importDefault(require("pify"));
const util_1 = __importDefault(require("util"));
const EXCLUDE_METHODS = ['apply', 'memoize', 'log', 'dir', 'noConflict'];
const sync = async_1.default;
function remove(arr, element) {
    const index = arr.indexOf(element);
    index !== -1 && arr.splice(index, 1);
}
const methods = Object.keys(async_1.default);
EXCLUDE_METHODS.forEach((exclude) => {
    remove(methods, exclude);
});
const asyncPromise = methods.reduce((accumulator, method) => {
    accumulator[method] = pify_1.default(sync[method]);
    return accumulator;
}, {});
exports.default = methods.reduce(function (accumulator, method) {
    accumulator[method] = (function () {
        const cb = arguments[arguments.length - 1];
        const proxy = util_1.default.isFunction(cb) ? async_1.default : asyncPromise;
        return proxy[method];
    })();
    return accumulator;
}, {});
