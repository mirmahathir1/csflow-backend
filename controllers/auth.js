const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');

const {SuccessResponse} = require('../response/success');
const TempUser = require('../models/tempuser');
const User = require('../models/user');


const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'restapimailtest@gmail.com',
        pass: 'nodespringresttest'
    }
});

const getMailOptions = (mail, token) => {
    return {
        from: 'restapimailtest@gmail.com',
        to: mail,
        subject: 'Verify your CSFlow account',
        text: 'Use the following link to verify your CSFlow account.\n' +
            `https://csflow-buet.web.app/#/auth/signUp/complete?token=${token}\n` +
            'Note: This link is valid for 1 hour only.'
    }
};

exports.logOut = async (req, res, next) => {
    try {
        let user = res.locals.middlewareResponse.user;
        let token = res.locals.middlewareResponse.token;

        await user.deleteToken(token);

        return res.status(200).send(new SuccessResponse("OK", 200, "Logged out successfully", null));
    } catch (e) {
        next(e);
    }
};

exports.logOutAllDevices = async (req, res, next) => {
    try {
        let user = res.locals.middlewareResponse.user;
        await user.deleteAllTokens();
        return res.status(200).send(new SuccessResponse("OK", 200,
            "Logged out of all devices successfully", null));
    } catch (e) {
        next(e);
    }
};

exports.autoLogIn = async (req, res, next) => {
    try {
        let user = res.locals.middlewareResponse.user;

        if(user)
            return res.status(200).send(new SuccessResponse("OK", 200,
            "Autologin successful", null));
    } catch (e) {
        next(e);
    }
};

exports.authSignUp = async (req, res, next) => {
    try {
        const email = res.locals.middlewareResponse.email;
        const name = res.locals.middlewareResponse.name;
        const password = res.locals.middlewareResponse.password;

        let token = jwt.sign({
            email,
            exp: Math.floor(Date.now() / 1000) + (60 * 60),
            random: Math.floor(Math.random()*1000000)
        }, process.env.BCRYPT_SALT);

        await TempUser.saveUserTemporarily(name, email, password, token);
        await transporter.sendMail(getMailOptions(email, token));

        res.status(200).send(new SuccessResponse(200, "OK",
            "A verification email has been sent to your email.", null));
    } catch (e) {
        next(e);
    }
};

exports.authSignUpComplete = async (req, res, next) => {
    try {
        const tempUser = res.locals.middlewareResponse;
        // console.log(tempUser);

        // console.log("deleting temp user");
        await TempUser.deleteTempAccountByEmail(tempUser.Email);
        // console.log("adding in user table")
        await User.addUser(tempUser);
        // console.log("Done")

        res.status(200).send(new SuccessResponse(200, "OK",
            "Sign up completed.", null));

    } catch (e) {
        next(e);
    }
};