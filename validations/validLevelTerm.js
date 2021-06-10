const {body,param,header} = require('express-validator/check')

exports.validateDetails = () => {
    return [
        body('term','term must be numeric').isNumeric(),
        body('level','level must be numeric').isNumeric(),
        body('level','level must be of 1 digit').isLength({ min: 1, max:1 }),
        body('term','term must be of 1 digit').isLength({ min: 1, max:1 })
    ]
}