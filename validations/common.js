const {body, param, header, query} = require('express-validator/check');

exports.isFieldExist = (fieldName) => {
    return body(fieldName, `Please provide a field with name ${fieldName}`).exists();
};

exports.validateEmail = () => {
    return [
        exports.isFieldExist('email'),
        body('email', 'Provided email is invalid').isEmail(),
    ];
};