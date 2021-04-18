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

router.post('/signIn/auto',
    authenticate.handleAuthentication,
    authController.autoLogIn,
);

router.post('/signUp',
    authValidators.validateSignUp(),
    authenticate.handlePOSTSignUp,
    authController.authSignUp,
);

router.patch('/signUp',
    authValidators.validateSignUpComplete(),
    authenticate.handlePATCHSignUpComplete,
    authController.authSignUpComplete,
);

router.patch('/password/change',
    authValidators.validatePasswordChange(),
    authenticate.handleAuthentication,
    authenticate.handlePATCHChangePassword,
    authController.changePassword,
);

router.patch('/password/forgot',
    authValidators.validateForgetPassword(),
    authenticate.handlePATCHForgetPassword,
    authController.forgetPassword,
);

router.patch('/password/recover',
    authValidators.validatePasswordRecover(),
    authenticate.handlePATCHPasswordRecover,
    authController.recoverPassword,
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
