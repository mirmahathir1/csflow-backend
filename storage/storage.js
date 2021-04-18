const express = require('express');
const router = new express.Router();
const multer = require('multer');
const {Storage} = require('@google-cloud/storage');
const path = require('path');
const fs = require('fs');

const MAX_IMAGE_SIZE = 2 * 1024 * 1024;
const MAX_IMAGE_COUNT = 10;

const baseURL = "https://storage.googleapis.com/csflow-buet.appspot.com/";

const fileFilter = (req, file, cb) => {
    const allowedTypes = ["image/jpeg", "image/jpg", "image/png"];

    if (!allowedTypes.includes(file.mimetype)) {
        const error = new Error("Only jpeg, jpg and png images are allowed.");
        error.code = "INCORRECT_FILETYPE";

        return cb(error, false);
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

let credentials = fs.readFileSync(path.join(__dirname, "..", "config", "15343789742.json"));
credentials = JSON.parse(credentials);
credentials = credentials.web;

const storage = new Storage({
    credentials,
    projectId: 'csflow-buet'
});

const bucketName = 'csflow-buet.appspot.com';
const bucket = storage.bucket(bucketName);

const uploadAnImage = async (image, dirName) => {
    console.log("enter");
    const name = getRandomName(image.originalname);
    const cloudStorageFileName = dirName + "/" + name;
    console.log(cloudStorageFileName);

    try {
        const file = bucket.file(cloudStorageFileName);

        // fs.createReadStream('/home/ashraful/Desktop/img.jpeg')
        //     .pipe(file.createWriteStream())
        //     .on('error', function (err) {
        //         console.log(err)
        //     })
        //     .on('finish', function () {
        //         console.log("done")
        //         // The file upload is complete.
        //     });

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
