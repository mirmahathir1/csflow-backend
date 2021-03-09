const {body,param} = require('express-validator/check')

exports.validateSignIn = () => {
    return [
        body('id', 'User ID does not exist').exists(),
        body('id','Student ID must be numeric').isNumeric(),
        body('id','Student ID must be of 7 digits').isLength({ min: 7, max:7 }),
        body('password', 'Invalid password field').exists(),
    ]
}

exports.validateDetails = () => {
    return [
        param('userId', 'Student ID does not exist').exists(),
        param('userId','Student ID must be numeric').isNumeric(),
        param('userId','Student ID must be of 7 digits').isLength({ min: 7, max:7 })
    ]
}