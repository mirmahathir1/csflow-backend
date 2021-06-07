const {body, param, header} = require('express-validator/check');

const {isFieldExist, matchStringType, matchNumericType} = require('./common');

exports.validateComment = () => {
    return [
        isFieldExist('description'),
        matchStringType('description'),
    ]
};