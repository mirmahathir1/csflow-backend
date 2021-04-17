const {body,param,header} = require('express-validator/check')

exports.validateDetails = () => {
    return [
        param('id', 'ID must be given').exists(),
        param('id','ID must be numeric').isNumeric(),
    ]
}