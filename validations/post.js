const {body, param, header} = require('express-validator/check');

const {isFieldExist, matchStringType, matchNumericType} = require('./common');

exports.validatePost = () => {
    return [
        isFieldExist('type'),
        matchStringType('type'),

        isFieldExist('title'),
        matchStringType('title'),

        isFieldExist('description'),
        matchStringType('description'),

        isFieldExist('course'),
        matchStringType('course'),

        isFieldExist('topic'),
        matchStringType('topic'),

        isFieldExist('termFinal'),
        body('termFinal', `'termFinal' must be object type`).isObject(),

        isFieldExist('customTag'),
        body('customTag', `'customTag' must be an array`).isArray(),

        isFieldExist('resources'),
        body('resources', `'resources' must be an array`).isArray(),
    ]
};

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