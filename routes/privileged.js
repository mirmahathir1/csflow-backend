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
router.get('/tag/requested',
    authenticate.handleAuthentication,
    authenticate.handlePrivilegedUser,
    privilegedController.getRequestedTags
)
router.patch('/tag/requested/:id',
    authenticate.handleAuthentication,
    authenticate.handlePrivilegedUser,
    idValidator.validateDetails(),
    privilegedController.updateRequestedTag
)
router.delete('/tag/requested/:id',
    authenticate.handleAuthentication,
    authenticate.handlePrivilegedUser,
    idValidator.validateDetails(),
    privilegedController.deleteRequestedTag
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
)
router.get('/report/answer',
    authenticate.handleAuthentication,
    authenticate.handlePrivilegedUser,
    privilegedController.getReportedAnswers
)
router.delete('/report/answer/:id/resolve',
    authenticate.handleAuthentication,
    authenticate.handlePrivilegedUser,
    idValidator.validateDetails(),
    privilegedController.resolveReportsofAnswer
)
router.get('/report/comment',
    authenticate.handleAuthentication,
    authenticate.handlePrivilegedUser,
    privilegedController.getReportedComments
)
router.delete('/report/comment/:id/resolve',
    authenticate.handleAuthentication,
    authenticate.handlePrivilegedUser,
    idValidator.validateDetails(),
    privilegedController.resolveReportsofComment
)
router.delete('/report/post/:id/resolve',
    authenticate.handleAuthentication,
    authenticate.handlePrivilegedUser,
    idValidator.validateDetails(),
    privilegedController.resolveReports
)
router.get('/report/post',
    authenticate.handleAuthentication,
    authenticate.handlePrivilegedUser,
    privilegedController.getReportedPosts
);
module.exports = router;