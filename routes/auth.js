const express = require('express');

const userController = require('../controllers/user');
const authController = require('../controllers/auth');
const userValidators = require('../validations/user')
const authValidators = require('../validations/auth')

const router = express.Router();

const authenticate = require('../middlewares/authenticate')

router.post('/signIn',
    authValidators.validateSignIn(),
    authenticate.handlePOSTLogIn
);



router.post('/signOutAllDevice',
    authenticate.handleAuthentication,
    authController.logOutAllDevices,
);

router.post('/signOut',
    authenticate.handleAuthentication,
    authController.logOut
);



module.exports = router;
