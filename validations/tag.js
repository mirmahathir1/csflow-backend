const {body, param, header} = require('express-validator/check');

const {isFieldExist, matchStringType, matchNumericType} = require('./common');

exports.validateTagRequest = () => {
    return [
        isFieldExist('name'),
        matchStringType('name'),
        isFieldExist('type'),
        matchStringType('type'),
        isFieldExist('course'),
        matchStringType('course'),
    ]
};
