const express = require('express');

const userController = require('../controllers/user');
const userValidators = require('../validations/user');
const {upload} = require('../storage/storage');

const router = express.Router();

const authenticate = require('../middlewares/authenticate')

router.get('/me',
    authenticate.handleAuthentication,
    userController.viewMyProfile
)

router.get('/:userId',
    userValidators.validateDetails(),
    authenticate.handleAuthentication,
    userController.viewProfile
);

router.delete('',
    authenticate.handleAuthentication,
    userController.deleteProfile,
);

router.patch('',
    userValidators.validateUpdateName(),
    authenticate.handleAuthentication,
    userController.updateName,
);

router.patch('/profilePic',
    authenticate.handleAuthentication,
    upload.single('image'),
    userController.uploadProfilePic,
);

module.exports = router;