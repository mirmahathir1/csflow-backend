const express = require('express');

const userController = require('../controllers/user');
const userValidators = require('../validations/user')

const router = express.Router();

const authenticate = require('../middlewares/authenticate')

router.post('/signIn',
    userValidators.validateSignIn(),
    authenticate.handlePOSTLogIn
);

router.get('/:userId',
    authenticate.handleAuthentication,
    userValidators.validateDetails(),
    userController.viewProfile
);

router.post('/signOutAllDevice',
    authenticate.handleAuthentication,
    userController.logOutAllDevices,
);

router.post('/signOut',
    authenticate.handleAuthentication,
    userController.logOut
);



module.exports = router;
