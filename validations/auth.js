const {body, param, header, query} = require('express-validator/check');

const {isFieldExist, validateEmail} = require('./common');

exports.validateSignIn = () => {
    return [
        ...validateEmail(),
        isFieldExist('password'),
    ];
};

exports.validateSignUp = () => {
    return [
        ...exports.validateSignIn(),
        isFieldExist('name'),
    ];
};

exports.validateSignUpComplete = () => {
    return [
        isFieldExist('token'),
    ];
};

exports.validatePasswordChange = () => {
    return [
        isFieldExist('oldPassword'),
        isFieldExist('newPassword'),
    ];
};

exports.validateForgetPassword = () => {
    return validateEmail();
};

exports.validatePasswordRecover = () => {
    return [
        isFieldExist('token'),
        isFieldExist('password'),
    ];
};
