const express = require('express');

const userController = require('../controllers/user');
const userValidators = require('../validations/user')

const router = express.Router();

const authenticate = require('../middlewares/authenticate')

router.get('/me',
    authenticate.handleAuthentication,
    userController.viewMyProfile
)

router.get('/:userId',
    authenticate.handleAuthentication,
    userValidators.validateDetails(),
    userController.viewProfile
);

router.delete('',
    authenticate.handleAuthentication,
    userController.deleteProfile,
);

// router.patch('',
//     authenticate.handleAuthentication,
//     userController.deleteProfile,
// );


module.exports = router;