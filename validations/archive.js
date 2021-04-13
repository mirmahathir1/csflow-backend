const {body,param,header} = require('express-validator/check')

exports.validateDetails = () => {
    return [
        //param('batchNumber', 'Student ID does not exist').exists(),
        param('batchNumber','Batch number must be numeric').isNumeric(),
        param('batchNumber','Batch number must be of 2 digits').isLength({ min: 2, max:2 }),
    ]
}