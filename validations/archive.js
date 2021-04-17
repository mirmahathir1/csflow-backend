const {body,param,header} = require('express-validator/check')

exports.validateDetails = () => {
    return [
        param('batchNumber', 'Batch number must be given').exists(),
        param('batchNumber','Batch number must be numeric').isNumeric(),
        param('batchNumber','Batch number must be of 2 digits').isLength({ min: 2, max:2 }),
    ]
}