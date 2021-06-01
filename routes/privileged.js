const express = require('express');
const privilegedController = require('../controllers/privileged');
const batchValidator = require('../validations/archive');
const thesisValidator = require('../validations/thesis');
const projectValidator = require('../validations/project');
const idValidator = require('../validations/id');
const driveValidator = require('../validations/LevelTerm');
const tagValidator = require('../validations/privileged');
const router = express.Router();
const authenticate = require('../middlewares/authenticate');

router.get('/user',
    authenticate.handleAuthentication,
    //authenticate.handlePrivilegedUser,
    privilegedController.getUsers
)
router.post('/tag',
    authenticate.handleAuthentication,
    authenticate.handlePrivilegedUser,
    tagValidator.validateDetails(),
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
    tagValidator.validateDetails(),
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
    tagValidator.validateDetails(),
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
router.delete('/report/answer/:id/remove',
    authenticate.handleAuthentication,
    authenticate.handlePrivilegedUser,
    idValidator.validateDetails(),
    privilegedController.removeReportsofAnswer
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
router.delete('/report/comment/:id/remove',
    authenticate.handleAuthentication,
    authenticate.handlePrivilegedUser,
    idValidator.validateDetails(),
    privilegedController.removeReportsofComment
)
router.delete('/report/post/:id/resolve',
    authenticate.handleAuthentication,
    authenticate.handlePrivilegedUser,
    idValidator.validateDetails(),
    privilegedController.resolveReportsofPost
)
router.delete('/report/post/:id/remove',
    authenticate.handleAuthentication,
    authenticate.handlePrivilegedUser,
    idValidator.validateDetails(),
    privilegedController.removeReportsofPost
)
router.get('/report/post',
    authenticate.handleAuthentication,
    authenticate.handlePrivilegedUser,
    privilegedController.getReportedPosts
)
router.post('/archive/resource',
    authenticate.handleAuthentication,
    authenticate.handlePrivilegedUser,
    driveValidator.validateDetails(),
    privilegedController.createResourceArchive
)
router.delete('/archive/resource/:termId',
    authenticate.handleAuthentication,
    authenticate.handlePrivilegedUser,
   // idValidator.validateDetails(),
    privilegedController.deleteResourceArchive
);
module.exports = router;