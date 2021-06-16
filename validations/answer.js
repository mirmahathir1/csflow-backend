const {body, param, header} = require('express-validator/check');

const {isFieldExist, matchStringType, matchNumericType} = require('./common');

exports.validateAnswer = () => {
    return [
        isFieldExist('description'),
        matchStringType('description'),

        isFieldExist('files'),
        body('files', `'files' must be an array`).isArray(),
    ]
};

exports.validateComment = () => {
    return [
        isFieldExist('description'),
        matchStringType('description'),
    ]
};