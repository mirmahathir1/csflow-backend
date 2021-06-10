const express = require('express');
const adminController = require('../controllers/admin');
const batchValidator = require('../validations/archive');
const thesisValidator = require('../validations/thesis');
const projectValidator = require('../validations/project');
const idValidator = require('../validations/id');
const driveValidator = require('../validations/LevelTerm');
const levelValidator = require('../validations/validLevelTerm');
const userIDValidator = require('../validations/userID');
const tagValidator = require('../validations/privileged');
const courseValidator = require('../validations/course');
const router = express.Router();
const authenticate = require('../middlewares/authenticate');

router.get('/course',
    authenticate.handleAuthentication,
    authenticate.handleAdmin,
    adminController.getAllCourses
)
router.post('/course',
    authenticate.handleAuthentication,
    authenticate.handleAdmin,
    courseValidator.validateDetails(),
    levelValidator.validateDetails(),
    adminController.createCourse
)
router.delete('/course/:courseId',
    authenticate.handleAuthentication,
    authenticate.handleAdmin,
    adminController.deleteCourse
)
router.patch('/course/:courseId',
    authenticate.handleAuthentication,
    authenticate.handleAdmin,
    levelValidator.validateDetails(),
    adminController.updateCourse
)
router.get('/batch/:batchNumber',
    authenticate.handleAuthentication,
    authenticate.handleAdmin,
    batchValidator.validateDetails(),
    adminController.getAllUsers
)
router.get('/batch/privileged/:batchNumber',
    authenticate.handleAuthentication,
    authenticate.handleAdmin,
    batchValidator.validateDetails(),
    adminController.getAllPrivilegedUsers
)
router.patch('/batch/:batchNumber',
    authenticate.handleAuthentication,
    authenticate.handleAdmin,
    batchValidator.validateDetails(),
    levelValidator.validateDetails(),
    adminController.updateLevelTerm
)
router.patch('/batch/privileged/:userId',
    authenticate.handleAuthentication,
    authenticate.handleAdmin,
    userIDValidator.validateDetails(),
    adminController.updateCR
)
router.delete('/project/:id',
    authenticate.handleAuthentication,
    authenticate.handleAdmin,
    idValidator.validateDetails(),
    adminController.deleteProject
)
router.delete('/thesis/:id',
    authenticate.handleAuthentication,
    authenticate.handleAdmin,
    idValidator.validateDetails(),
    adminController.deleteThesis
)
router.delete('/batch/:userId',
    authenticate.handleAuthentication,
    authenticate.handleAdmin,
    userIDValidator.validateDetails(),
    adminController.deleteUser
);
module.exports = router;