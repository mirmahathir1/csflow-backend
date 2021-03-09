const express = require('express');

const userController = require('../controllers/user');
const userValidators = require('../validations/user')

const router = express.Router();

const authenticate = require('../middlewares/authenticate')
const {body} = require('express-validator/check')

router.post('/signIn',
    userValidators.validateSignIn(),
    authenticate.handlePOSTLogIn
);

module.exports = router;
