const {body,param,header} = require('express-validator/check')

exports.validateDetails = () => {
    return [
        body('type', 'Please provide topic').exists().isString(),
        body('courseId', 'Please provide courseId').exists().isString(),
        body('name', 'Please provide name').exists().isString()


    ]
}