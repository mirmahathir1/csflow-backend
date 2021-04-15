const {body,param,header} = require('express-validator/check')

exports.validateDetails = () => {
    return [
        body('title', 'Please provide title').exists().isString(),
        body('description', 'Please provide description').exists().isString(),
        body('videolink', 'Please provide link').exists().isString(),
        body('codelink', 'Please provide link').exists().isString(),
        //body('writers', 'Please provide writers').isArray({min: 1}),
        body('owners', 'Please provide owners').isArray({min: 1})

    ]
}