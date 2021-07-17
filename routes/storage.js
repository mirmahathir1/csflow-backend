const express = require('express');
const router = express.Router();

const authenticate = require('../middlewares/authenticate');
const storageController = require('../controllers/storage');
const storageValidator = require('../validations/storage');
const {upload} = require('../storage/storage');

const MAX_FILE_COUNT = 10;

router.post('/',
    authenticate.handleAuthentication,
    upload.array('files', MAX_FILE_COUNT),
    storageController.uploadFiles,
);

router.post('/remove',
    storageValidator.validateDeleteResources(),
    authenticate.handleAuthentication,
    storageController.deleteFiles,
);

module.exports = router;
