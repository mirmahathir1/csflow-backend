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

module.exports = router;
