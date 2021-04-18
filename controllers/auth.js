const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
const bcrypt = require('bcryptjs');

const {SuccessResponse} = require('../response/success');
const TempUser = require('../models/tempuser');
const ForgetPassword = require('../models/forgetpassword');
const User = require('../models/user');

const getEncryptedPassword = async (password) => {
    const salt = await bcrypt.genSalt(10);
    return await bcrypt.hash(password, salt);
};

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'restapimailtest@gmail.com',
        pass: 'nodespringresttest'
    }
});

const getMailOptions = (mail, text) => {
    return {
        from: 'restapimailtest@gmail.com',
        to: mail,
        subject: 'Verify your CSFlow account',
        text: text
    }
};

const getSignUpOptions = (mail, token) => {
    const text = 'Use the following link to verify your CSFlow account.\n' +
        `https://csflow-buet.web.app/#/auth/signUp/complete?token=${token}\n` +
        'Note: This link is valid for 1 hour only.';
    return getMailOptions(mail, text);
};

const getPasswordRecoverOptions = (mail, token) => {
    const text = 'Use the following link to recover your password.\n' +
        `https://csflow-buet.web.app/#/auth/password/recover?token=${token}\n` +
        'Note: This link is valid for 1 hour only.';
    return getMailOptions(mail, text);
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

        const token = jwt.sign({
            email,
            exp: Math.floor(Date.now() / 1000) + (60 * 60),
            random: Math.floor(Math.random()*1000000)
        }, process.env.BCRYPT_SALT);

        await TempUser.saveUserTemporarily(name, email, await getEncryptedPassword(password), token);
        await transporter.sendMail(getSignUpOptions(email, token));

        return res.status(200).send(new SuccessResponse(200, "OK",
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

        return res.status(200).send(new SuccessResponse(200, "OK",
            "Sign up completed.", null));

    } catch (e) {
        // console.log(e)
        next(e);
    }
};

exports.changePassword = async (req, res, next) => {
    try {
        const user = res.locals.middlewareResponse.user;
        // console.log(user);
        const encryptedNewPassword = await getEncryptedPassword(req.body.newPassword);
        await user.changePassword(encryptedNewPassword);

        return res.status(200).send(new SuccessResponse(200, "OK",
            "Password change successful.", null));

    } catch (e) {
        next(e);
    }
};

exports.forgetPassword = async (req, res, next) => {
    try {
        const email = req.body.email;

        const token = jwt.sign({
            email,
            exp: Math.floor(Date.now() / 1000) + (60 * 60),
            random: Math.floor(Math.random()*1000000)
        }, process.env.BCRYPT_SALT);

        await ForgetPassword.saveToken(email, token);
        await transporter.sendMail(getPasswordRecoverOptions(email, token));

        return res.status(200).send(new SuccessResponse(200, "OK",
            "An email has been sent for password recovery.", null));

    } catch (e) {
        next(e);
    }
};

exports.recoverPassword = async (req, res, next) => {
    try {
        const user = res.locals.middlewareResponse;
        await ForgetPassword.deleteByEmail(user.email);
        const encryptedNewPassword = await getEncryptedPassword(req.body.password);
        await user.changePassword(encryptedNewPassword);

        return res.status(200).send(new SuccessResponse(200, "OK",
            "Password changed successfully.", null));
    } catch (e) {
        next(e);
    }
};
