const {body,param,header} = require('express-validator/check')

exports.validateDetails = () => {
    return [
        param('userId', 'userID must be given').exists(),
        param('userId','userID must be numeric').isNumeric(),
        param('userId','userID must be of 7 digits').isLength({ min: 7, max:7 })
    ]
}