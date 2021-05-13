const express = require('express');
const privilegedController = require('../controllers/privileged');
const batchValidator = require('../validations/archive');
const thesisValidator = require('../validations/thesis');
const projectValidator = require('../validations/project');
const idValidator = require('../validations/id');
const router = express.Router();
const authenticate = require('../middlewares/authenticate');

router.get('/user',
    authenticate.handleAuthentication,
    authenticate.handlePrivilegedUser,
    privilegedController.getUsers
)
router.post('/tag',
    authenticate.handleAuthentication,
    authenticate.handlePrivilegedUser,
    privilegedController.createTag
)
router.post('/tag/:id',
    authenticate.handleAuthentication,
    authenticate.handlePrivilegedUser,
    idValidator.validateDetails(),
    privilegedController.acceptRequestedTag
)
router.patch('/tag/:id',
    authenticate.handleAuthentication,
    authenticate.handlePrivilegedUser,
    idValidator.validateDetails(),
    privilegedController.updateTag
)
router.delete('/tag/:id',
    authenticate.handleAuthentication,
    authenticate.handlePrivilegedUser,
    idValidator.validateDetails(),
    privilegedController.deleteTag
)
router.get('/tagCourse',
    authenticate.handleAuthentication,
    authenticate.handlePrivilegedUser,
    privilegedController.getCourseTags
)
router.get('/tag',
    authenticate.handleAuthentication,
    authenticate.handlePrivilegedUser,
    privilegedController.getAllTags
);
module.exports = router;