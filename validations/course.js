
const {body, param, header} = require('express-validator/check');
const {isFieldExist, matchStringType, matchNumericType} = require('./common');

exports.validateDetails = () => {
    return [
        isFieldExist('courseId'),
        matchStringType('courseId'),
        isFieldExist('title'),
        matchStringType('title'),
        isFieldExist('level'),
        isFieldExist('term'),
        isFieldExist('batch')
    ]
};

