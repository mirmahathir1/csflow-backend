const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const emailValidator = require('deep-email-validator');

const User = require('../models/user');
const TempUser = require('../models/tempuser');
const ForgetPassword = require('../models/forgetpassword');


const {validationResult} = require('express-validator');
const {ErrorHandler} = require('../response/error');
const {SuccessResponse} = require('../response/success');


exports.handlePOSTLogIn = async (req, res, next) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).send(new ErrorHandler(400, "Missing fields in request body"));
        }

        let email = req.body.email;
        let password = req.body.password;
        let user = await User.findByEmail(email);

        if (!user) {
            return res.status(401).send(new ErrorHandler(401, "Incorrect email / password"));
        }

        let matched = await bcrypt.compare(password, user.password);

        if (matched) {
            let token = jwt.sign({id: user.id}, process.env.BCRYPT_SALT);
            await user.saveToken(token);
            return res.status(201).send(new SuccessResponse("OK", 201, "Successfully logged in", token));
        } else {
            return res.status(401).send(new ErrorHandler(401, 'Incorrect email / password'));
        }
    } catch (e) {
        return res.status(500).send(new ErrorHandler(500, e.message));
    }
};

exports.handleAuthentication = async (req, res, next) => {
    if (!req.header('Authorization')) {
        return res.status(401).send(new ErrorHandler(401, 'Authentication header not found'));
    }

    let token;

    try {
        token = req.header('Authorization').replace('Bearer ', '');
        await jwt.verify(token, process.env.BCRYPT_SALT);
    } catch (e) {
        return res.status(401).send(new ErrorHandler(401, "Malformed JWT token"));
    }

    try {
        let user = await User.findByToken(token);
        if (!user) {
            return res.status(401).send(new ErrorHandler(401, "Invalid user"));
        }
        res.locals.middlewareResponse = {
            user,
            token
        };
        return next();

    } catch (e) {
        return res.status(500).send(new ErrorHandler(500, e.message));
    }
};

exports.handlePOSTSignUp = async (req, res, next) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).send(new ErrorHandler(400, "Missing/ miswritten fields in request"));
        }

        let email = req.body.email;
        let name = req.body.name;
        let password = req.body.password;

        if (password.length < 6)
            return res.status(400).send(new ErrorHandler(400,
                "Password must have a minimum length of 6 characters"));

        let response = await emailValidator.validate(email);
        if (!response.valid)
            return res.status(400).send(new ErrorHandler(400,
                "Invalid email address"));

        let user = await User.findByEmail(email);
        if (user)
            return res.status(400).send(new ErrorHandler(400,
                "Associated email address already has an account"));

        try{
            parseInt(email.substring(0, 7))
        }catch (e) {
            return res.status(400).send(new ErrorHandler(400,
                "Please Sign Up using departmental email."));
        }

        if (email.substring(2, 4) !== '05')
            return res.status(400).send(new ErrorHandler(400,
                "Please Sign Up using departmental email."));

        if (email.substring(7) !== '@ugrad.cse.buet.ac.bd')
            return res.status(400).send(new ErrorHandler(400,
                "Please Sign Up using departmental email."));

        res.locals.middlewareResponse = {
            email,
            name,
            password,
        };

        return next();
    } catch (e) {
        return res.status(500).send(new ErrorHandler(500, e.message));
    }
};

exports.handlePATCHSignUpComplete = async (req, res, next) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty())
            return res.status(400).send(new ErrorHandler(400, "Missing/ miswritten fields in request"));

        const token = req.body.token;
        const response = await jwt.verify(token, process.env.BCRYPT_SALT);

        if (response.exp == null || response.email == null || response.random == null)
            return res.status(400).send(new ErrorHandler(400, "Invalid Token."));

        const tempUser = await TempUser.getTempUserByToken(token);
        if (!tempUser || tempUser.email !== res.email)
            return res.status(400).send(new ErrorHandler(400, "Invalid Token."));

        res.locals.middlewareResponse = tempUser;
        return next();
    } catch (e) {
        if (e.message === 'jwt expired')
            return res.status(400).send(new ErrorHandler(400,
                "Verification link expired. You must verify your email within one hour."));
        else
            return res.status(500).send(new ErrorHandler(500, e.message));
    }
};

exports.handlePATCHChangePassword = async (req, res, next) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty())
            return res.status(400).send(new ErrorHandler(400,
                "Missing/ miswritten fields in request"));

        const newPassword = req.body.newPassword;
        if (newPassword.length < 6)
            return res.status(400).send(new ErrorHandler(400,
                "New password must have a minimum length of 6 characters"));

        const oldPassword = req.body.oldPassword;
        const user = res.locals.middlewareResponse.user;
        const matched = await bcrypt.compare(oldPassword, user.password);
        if (!matched)
            return res.status(400).send(new ErrorHandler(400,
                "Incorrect old password"));

        return next();
    } catch (e) {
        return res.status(500).send(new ErrorHandler(500, e.message));
    }
};

exports.handlePATCHForgetPassword = async (req, res, next) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty())
            return res.status(400).send(new ErrorHandler(400,
                "Missing Email field or Invalid Email."));

        const email = req.body.email;
        const response = await emailValidator.validate(email);
        if (!response.valid)
            return res.status(400).send(new ErrorHandler(400,
                "Invalid email address"));

        const user = await User.findByEmail(email);
        // console.log(user);
        if (!user)
            return res.status(400).send(new ErrorHandler(400,
                "Email not found"));

        return next();
    } catch (e) {
        return res.status(500).send(new ErrorHandler(500, e.message));
    }
};

exports.handlePATCHPasswordRecover = async (req, res, next) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty())
            return res.status(400).send(new ErrorHandler(400,
                "Missing/ miswritten fields in request"));

        if (req.body.password.length < 6)
            return res.status(400).send(new ErrorHandler(400,
                "Password must have a minimum length of 6 characters."));

        const token = req.body.token;
        const response = await jwt.verify(token, process.env.BCRYPT_SALT);

        if (response.exp == null || response.email == null || response.random == null)
            return res.status(400).send(new ErrorHandler(400, "Invalid Token."));

        const email = await ForgetPassword.getEmailByToken(token);
        if (email == null || email !== response.email)
            return res.status(400).send(new ErrorHandler(400, "Invalid Token."));

        res.locals.middlewareResponse = await User.findByEmail(email);

        return next();
    } catch (e) {
        if (e.message === 'jwt expired')
            return res.status(400).send(new ErrorHandler(400,
                "Verification link expired. You must verify your email within one hour."));
        else
            return res.status(500).send(new ErrorHandler(500, e.message));
    }
};
