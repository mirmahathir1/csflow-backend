const {body,param,header} = require('express-validator/check')

exports.validateDetails = () => {
    return [
        param('userId', 'Student ID does not exist').exists(),
        param('userId','Student ID must be numeric').isNumeric(),
        param('userId','Student ID must be of 7 digits').isLength({ min: 7, max:7 }),
    ]
}