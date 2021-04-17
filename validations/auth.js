const {body, param, header, query} = require('express-validator/check');

const isFieldExist = (fieldName) => {
    return body(fieldName, `Please provide a field with name ${fieldName}`).exists();
};

const validateEmail = () => {
    return [
        isFieldExist('email'),
        body('email', 'Provided email is invalid').isEmail(),
    ];
};

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
