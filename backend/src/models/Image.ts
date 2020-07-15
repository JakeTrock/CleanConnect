import GridFsStorage from 'multer-gridfs-storage';
import keys from '../config/keys.json';
import multer from 'multer';
const codecs: Array<string> = [
    "video/mp4",
    "video/webm",
    "image/webp",
    "image/gif",
    "image/jpeg",
    "image/png",
    "image/jpg",
    "image/tiff"
];
const storage = new GridFsStorage({
    url: keys.url,
    file: (req, file) => {
        return new Promise((resolve, reject) => {
            if (codecs.indexOf(file.mimetype) >= 0) {//TODO:add filesize limit
                resolve({
                    bucketName: 'uploads'
                });
            } else
                reject("Invalid filetype(we allow png, jpg, jpeg, webp, gif, tiff, mp4 and webm uploads up to 5.1 MB)");
        });
    }
});
export default multer({ storage });