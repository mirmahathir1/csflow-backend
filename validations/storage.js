const {body, param, header} = require('express-validator/check');

const {isFieldExist, matchStringType, matchNumericType} = require('./common');

exports.validateDeleteResources = () => {
    return [
        isFieldExist('links'),
        body('links', `'links' must be an array`).isArray(),
    ]
};
