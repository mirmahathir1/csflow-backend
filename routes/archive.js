const express = require('express');
const archiveController = require('../controllers/archive');
const router = express.Router();
router.get('/resource',
    //authenticate.handleAuthentication,
    archiveController.getAllDriveLinks
);
module.exports = router;