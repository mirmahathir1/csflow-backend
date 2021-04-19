const multer = require('multer');
const {Storage} = require('@google-cloud/storage');

const {credentials} = require('./credentials');
const {ErrorHandler} = require('../response/error');


const MAX_IMAGE_SIZE = 2 * 1024 * 1024;
const MAX_IMAGE_COUNT = 10;

const baseURL = "https://storage.googleapis.com/csflow-buet.appspot.com/";

const fileFilter = (req, file, cb) => {
    const allowedTypes = ["image/jpeg", "image/jpg", "image/png"];

    if (!allowedTypes.includes(file.mimetype)) {
        // const error = new Error();
        // error.code = "INCORRECT_FILETYPE";
        //
        return cb(new ErrorHandler(400,
            "Only jpeg, jpg and png images are allowed."), false);
    }

    return cb(null, true);
}

const upload = multer({
    storage: multer.memoryStorage(),
    fileFilter,
    limits: {
        fileSize: MAX_IMAGE_SIZE
    }
});

const storage = new Storage({
    credentials,
    projectId: process.env.STORAGE_PROJECT_ID
});

const bucketName = 'csflow-buet.appspot.com';
const bucket = storage.bucket(bucketName);

const uploadAnImage = async (image, dirName) => {
    // console.log("enter");
    const name = getRandomName(image.originalname);
    const cloudStorageFileName = dirName + "/" + name;
    // console.log(cloudStorageFileName);

    try {
        const file = bucket.file(cloudStorageFileName);

        await file.createWriteStream({
            resemble: false
        }).end(image.buffer);

        return baseURL + cloudStorageFileName;
    } catch (e) {
        console.log(e)
        throw new Error("Can not upload");
    }
}

const getRandomName = (name) => {
    return new Date().getTime().toString() +
        Math.ceil(Math.random() * 10000000 + 11234543).toString() +
        "." + name.split('.').pop()
}

module.exports = {
    upload,
    uploadAnImage
}
