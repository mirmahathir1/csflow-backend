const {body,param,header} = require('express-validator/check')

exports.validateDetails = () => {
    return [
        body('title', 'Please provide title').exists().isString(),
        body('course','Please provide course number').exists().isString(),
        body('description', 'Please provide description').exists().isString(),
        body('youtube', 'Please provide link').exists().isString(),
        body('github', 'Please provide link').exists().isString(),
        body('tags', 'Please provide tags').isArray({min: 1}),
        //body('writers', 'Please provide writers').isArray({min: 1}),
        body('owners', 'Please provide owners').isArray({min: 1})

    ]
}