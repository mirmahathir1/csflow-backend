const {body} = require('express-validator/check')

exports.validateSignIn = () => {
    return [
        body('id', 'Invalid ID field').exists(),
        body('password', 'Invalid password field').exists(),
    ]
}