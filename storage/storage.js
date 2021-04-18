const express = require('express')
const router = new express.Router()
const multer = require('multer')
const {Storage} = require('@google-cloud/storage')
const path = require('path')

const MAX_IMAGE_SIZE = 10 * 1024 * 1024
const MAX_IMAGE_COUNT = 10

const fileFilter = (req, file, cb) => {
    const allowedTypes = ["image/jpeg", "image/jpg", "image/png"]

    if(!allowedTypes.includes(file.mimetype)){
        const error = new Error("Only jpeg, jpg and png images are allowed.")
        error.code = "INCORRECT_FILETYPE"

        return cb(error, false)
    }

    return cb(null, true)
}

const upload = multer({
    storage: multer.memoryStorage(),
    fileFilter,
    limits: {
        fileSize: MAX_IMAGE_SIZE
    }
})

const storage = new Storage({
    keyFilename: path.join(__dirname, "../../Ajraar-shop-c838fbef2c87.json"),
    projectId: 'ajraar-shop'
});

const bucketName = 'ajraar-shop.appspot.com';
const bucket = storage.bucket(bucketName);

const baseURL = "https://storage.googleapis.com/ajraar-shop.appspot.com/"

router.post('/dashboard/image', upload.single('image'), async (req, res) => {
    try {
        let image = await uploadAnImage(req.file, "photos")
        //console.log("send")
        res.send(image)
    }catch (e) {
        res.status(400).send("Can not upload image")
    }
})

router.post('/user/image', upload.single('image'), async (req, res) => {
    try {
        let image = await uploadAnImage(req.file, "user/profilePic")
        //console.log("send")
        res.send(image)
    }catch (e) {
        res.status(400).send("Can not upload image")
    }
})

router.post('/dashboard/images', upload.array('images', MAX_IMAGE_COUNT), async (req, res) => {
    try {
        let images = []
        for (let i=0; i<req.files.length; i++){
            let image = await uploadAnImage(req.files[i], "products")
            images.push(image)
        }
        res.send(images)
    }catch (e) {
        res.status(400).send("Can not upload images")
    }
})

const uploadAnImage = async (image, dirName) => {
    const name = getRandomName(image.originalname)
    const cloudStorageFileName = dirName + "/"  + name
    const file = bucket.file(cloudStorageFileName);

    try {
        await file.createWriteStream({resemble: false}).end(image.buffer)
        //console.log("done")
        return {
            name,
            link: baseURL + cloudStorageFileName,
        }
        //return cloudStorageFileName
    }catch(e) {
        throw new Error("Can not upload")
    }
}


const getRandomName = (name) => {
    return new Date().getTime().toString() +
        Math.ceil(Math.random() * 10000000 + 11234543).toString() +
        "." + name.split('.').pop()
}

module.exports = router


// Do not delete
// const name = getRandomName(req.file.originalname)
// const cloudStorageFileName = "photo/"  + name
// const file = bucket.file(cloudStorageFileName);
//
// file.createWriteStream({resemble: false})
//     .on('error', function(err) {
//         console.log(err)
//         res.status(400).send("Error")
//     })
//     .on('finish', function(result) {
//         //console.log("Done")
//         //console.log("DownLoad Link",  baseURL + cloudStorageFileName)
//
//         res.send({
//             name,
//             link: baseURL + cloudStorageFileName,
//         })
//
//     }).end(req.file.buffer)
