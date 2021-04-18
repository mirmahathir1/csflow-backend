const {Storage} = require('@google-cloud/storage')

const {credentials} = require('./credentials');

const storage = new Storage({
    credentials,
    projectId: process.env.STORAGE_PROJECT_ID
});

const bucketName = 'csflow-buet.appspot.com';
const baseURL = "https://storage.googleapis.com/csflow-buet.appspot.com/";

const deleteImage = async (filename) => {
    filename = filename.substring(baseURL.length);
    console.log(filename);
    await storage.bucket(bucketName).file(filename).delete();
}

module.exports = {
    deleteImage,
}
