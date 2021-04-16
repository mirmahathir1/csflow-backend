const {body, param, header, query} = require('express-validator/check')

exports.validateSignIn = () => {
    return [
        body('email', 'Please provide email').exists(),
        body('email', 'Provided email is invalid').isEmail(),
        body('password', 'Invalid password field').exists(),
    ];
};

exports.validateSignUp = () => {
    return [
        ...exports.validateSignIn(),
        body('name', 'Please provide name').exists(),
    ];
};

exports.validateSignUpComplete = () => {
    return [
        body('token', 'Please provide token').exists(),
    ];
};

