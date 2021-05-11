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
router.get('/resource',
    authenticate.handleAuthentication,
);
module.exports = router;