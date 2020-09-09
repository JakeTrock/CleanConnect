"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const multer_gridfs_storage_1 = __importDefault(require("multer-gridfs-storage"));
const keys_json_1 = __importDefault(require("../config/keys.json"));
const multer_1 = __importDefault(require("multer"));
const codecs = [
    "video/mp4",
    "video/webm",
    "image/webp",
    "image/gif",
    "image/jpeg",
    "image/png",
    "image/jpg",
    "image/tiff"
];
const storage = new multer_gridfs_storage_1.default({
    url: keys_json_1.default.url,
    file: (req, file) => new Promise((resolve, reject) => {
        if (codecs.indexOf(file.mimetype) >= 0)
            resolve({
                bucketName: 'uploads'
            });
        else
            reject({ ie: true, message: "Invalid filetype(we allow png, jpg, jpeg, webp, gif, tiff, mp4 and webm uploads up to 5.1 MB)" });
    })
});
exports.default = multer_1.default({
    storage,
    limits: {
        fileSize: 32000000
    }
});
