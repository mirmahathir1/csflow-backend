const {body,param,header} = require('express-validator/check')

exports.validateDetails = () => {
    return [
        body('title', 'Please provide title').exists().isString(),
        body('description', 'Please provide description').exists().isString(),
        body('link', 'Please provide link').exists().isString(),
        body('writers', 'Please provide writers').isArray({min: 1}),
        body('owners', 'Please provide owners').isArray({min: 1})
        //body('owners','pls').isObject()
        //body('batchNumber','Batch number must be numeric').isNumeric(),
        //body('batchNumber','Batch number must be of 2 digits').isLength({ min: 2, max:2 }),
    ]
}