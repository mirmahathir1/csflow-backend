const express = require('express');
const archiveController = require('../controllers/archive');
const batchValidator = require('../validations/archive');

const router = express.Router();
router.get('/thesis/batch/:batchNumber',
    batchValidator.validateDetails(),
    archiveController.getThesisByBatchID
)
router.get('/resource',
    archiveController.getAllDriveLinks
);
module.exports = router;