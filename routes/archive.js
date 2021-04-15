const express = require('express');
const archiveController = require('../controllers/archive');
const batchValidator = require('../validations/archive');
const thesisValidator = require('../validations/thesis');
const router = express.Router();
const authenticate = require('../middlewares/authenticate');
router.get('/thesis/batch/:batchNumber',
    authenticate.handleAuthentication,
    batchValidator.validateDetails(),
    archiveController.getThesisByBatchID
)
router.get('/thesis/:id',
    authenticate.handleAuthentication,
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
router.get('/project/batch/:batchNumber',
    authenticate.handleAuthentication,
    batchValidator.validateDetails(),
    archiveController.findCoursesOfProject
)
router.get('/project/batch/:batchNumber/:courseNum',
    authenticate.handleAuthentication,
    batchValidator.validateDetails(),
    archiveController.findProjectList
)
router.get('/batch',
    authenticate.handleAuthentication,
    archiveController.getBatchList
)
router.get('/resource',
    authenticate.handleAuthentication,
    archiveController.getAllDriveLinks
);
module.exports = router;