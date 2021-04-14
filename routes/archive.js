const express = require('express');
const archiveController = require('../controllers/archive');
const batchValidator = require('../validations/archive');
const thesisValidator = require('../validations/thesis');
const router = express.Router();
const authenticate = require('../middlewares/authenticate');
router.get('/thesis/batch/:batchNumber',
    batchValidator.validateDetails(),
    archiveController.getThesisByBatchID
)
router.get('/thesis/:id',
    archiveController.getThesisDetailsByThesisID
)
router.post('/thesis',
    authenticate.handleAuthentication,
    thesisValidator.validateDetails(),
    archiveController.postThesis
)
router.delete('/thesis/:id',
    authenticate.handleAuthentication,
    archiveController.deleteThesis
)
router.patch('/thesis/:id',
    authenticate.handleAuthentication,
    thesisValidator.validateDetails(),
    archiveController.editThesis
)
router.get('/batch',
    archiveController.getBatchList
)
router.get('/resource',
    archiveController.getAllDriveLinks
);
module.exports = router;