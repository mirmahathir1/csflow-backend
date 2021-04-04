const {body,param,header} = require('express-validator/check')

exports.validateSignIn = () => {
    return [
        body('email', 'Please provide email').exists(),
        body('email','Provided email is invalid').isEmail(),
        body('password', 'Invalid password field').exists(),
    ]
}