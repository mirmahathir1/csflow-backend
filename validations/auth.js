const {body, param, header, query} = require('express-validator/check');

const {isFieldExist, validateEmail, matchStringType} = require('./common');

exports.validateSignIn = () => {
    return [
        ...validateEmail(),
        isFieldExist('password'),
        matchStringType('password'),
    ];
};

exports.validateSignUp = () => {
    return [
        ...exports.validateSignIn(),
        isFieldExist('name'),
        matchStringType('name'),
    ];
};

exports.validateSignUpComplete = () => {
    return [
        isFieldExist('token'),
        matchStringType('token'),
    ];
};

exports.validatePasswordChange = () => {
    return [
        isFieldExist('oldPassword'),
        matchStringType('oldPassword'),
        isFieldExist('newPassword'),
        matchStringType('newPassword'),
    ];
};

exports.validateForgetPassword = () => {
    return validateEmail();
};

exports.validatePasswordRecover = () => {
    return [
        isFieldExist('token'),
        matchStringType('token'),
        isFieldExist('password'),
        matchStringType('password'),
    ];
};
