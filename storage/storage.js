const express = require('express');
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

const credentials = {
    type: process.env.STORAGE_TYPE,
    project_id: process.env.STORAGE_PROJECT_ID,
    private_key_id: process.env.STORAGE_PRIVATE_KEY_ID,
    private_key: process.env.STORAGE_PRIVATE_KEY,
    client_email: process.env.STORAGE_CLIENT_EMAIL,
    client_id: process.env.STORAGE_CLIENT_ID,
    auth_uri: process.env.STORAGE_AUTH_URI,
    token_uri: process.env.STORAGE_TOKEN_URI,
    auth_provider_x509_cert_url: process.env.STORAGE_AUTH_PROVIDER_X509_CERT_URL,
    client_x509_cert_url: process.env.STORAGE_CLIENT_X509_CERT_URL,
}

// console.log(credentials)
// let credentails = fs.readFileSync(path.join(__dirname, "..", "config", "csflow-buet-117f9b557ef8.json"));
// credentails= JSON.parse(credentails);
//
// // console.log(credentails)
//
// for (let key in credentails){
//     console.log(`STORAGE_${key.toUpperCase()}=${credentails[key]}`);
// }
//
// console.log()
// for (let key in credentails){
//     console.log(`${key}: process.env.STORAGE_${key.toUpperCase()},`);
// }
//
// process.exit(0)

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
