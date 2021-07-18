const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
const bcrypt = require('bcryptjs');
const dateTime = require('node-datetime');

const {SuccessResponse} = require('../response/success');
const TempUser = require('../models/tempuser');
const ForgetPassword = require('../models/forgetpassword');
const User = require('../models/user');
const {ErrorHandler} = require('../response/error');

const getEncryptedPassword = async (password) => {
    const salt = await bcrypt.genSalt(10);
    return await bcrypt.hash(password, salt);
};

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.MAIL_ID,
        pass: process.env.MAIL_PASSWORD,
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
    console.log(text);
    return getMailOptions(mail, text);
};

const getPasswordRecoverOptions = (mail, token) => {
    const text = 'Use the following link to recover your password.\n' +
        `https://csflow-buet.web.app/#/auth/password/recover?token=${token}\n` +
        'Note: This link is valid for 1 hour only.';
    //console.log("reached 4"+mail+"   "+token);
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

        if (user)
            return res.status(200).send(new SuccessResponse("OK", 200,
                "Autologin successful", null));
    } catch (e) {
        next(e);
    }
};

const deleteAllTimeExceedTempAccount = async (TempUser) => {
    const result = await TempUser.getAllTempUser();
    for (let i = 0; i < result[0].length; i++) {
        const row = result[0][i];
        try {
            const res = await jwt.verify(row.Token, process.env.BCRYPT_SALT);
            const expireDate = new Date(res.exp * 1000);
            if (expireDate < (new Date()))
                await TempUser.deleteTempAccountByEmail(row.Email);
        } catch (e) {
            await TempUser.deleteTempAccountByEmail(row.Email);
        }
    }
}

exports.authSignUp = async (req, res, next) => {
    try {
        const email = res.locals.middlewareResponse.email;
        const name = res.locals.middlewareResponse.name;
        const password = res.locals.middlewareResponse.password;

        const token = jwt.sign({
            email,
            exp: Math.floor(Date.now() / 1000) + (60 * 60),
            random: Math.floor(Math.random() * 1000000)
        }, process.env.BCRYPT_SALT);

        try {
            await deleteAllTimeExceedTempAccount(TempUser);
            await TempUser.deleteTempAccountByEmail(email);
            await TempUser.saveUserTemporarily(name, email, await getEncryptedPassword(password), token);

            //CODE EDITED BY MAHATHIR FROM HERE-------------------------------------
            // await transporter.sendMail(getSignUpOptions(email, token));
            const tempUser = await TempUser.getTempUserByToken(token);

            await TempUser.deleteTempAccountByEmail(tempUser.Email);
            // console.log("adding in user table")
            const dt = dateTime.create();
            const formatted = dt.format('Y-m-d H:M:S');
            // console.log(formatted);
            let user = {
                id: tempUser.Email.substring(0, 7),
                batchID: tempUser.Email.substring(0, 2),
                name: tempUser.Name,
                email: tempUser.Email,
                password: tempUser.Password,
                joiningDate: formatted,
            };

            if (Number.isInteger(user.id) === false) {
                let lastId = await User.getLastID();
                // console.log(lastId)
                if (lastId < 10000000)
                    lastId = 10000000;
                // console.log(lastId)
                user.id = lastId + 1;
                user.batchID = 0;
            }

            await User.addUser(user);
            // console.log("Done")

            return res.status(200).send(new SuccessResponse(200, "OK",
                "Sign up completed.", null));
        } catch (e) {
            console.log(e);
            return res.status(400).send(new ErrorHandler(400,
                `Unexpected error. Try again later.`));
        }

        // return res.status(200).send(new SuccessResponse(200, "OK",
        //     "A verification email has been sent to your email.", null));
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
        const dt = dateTime.create();
        const formatted = dt.format('Y-m-d H:M:S');
        // console.log(formatted);
        let user = {
            id: tempUser.Email.substring(0, 7),
            batchID: tempUser.Email.substring(0, 2),
            name: tempUser.Name,
            email: tempUser.Email,
            password: tempUser.Password,
            joiningDate: formatted,
        };

        if (Number.isInteger(user.id) === false) {
            let lastId = await User.getLastID();
            // console.log(lastId)
            if (lastId < 10000000)
                lastId = 10000000;
            // console.log(lastId)
            user.id = lastId + 1;
            user.batchID = 0;
        }

        await User.addUser(user);
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

const deleteAllTimeExceed = async (ForgetPassword) => {
    const result = await ForgetPassword.getAllAccount();
    for (let i = 0; i < result[0].length; i++) {
        const row = result[0][i];
        try {
            const res = await jwt.verify(row.Token, process.env.BCRYPT_SALT);
            const expireDate = new Date(res.exp * 1000);
            if (expireDate < (new Date()))
                await ForgetPassword.deleteByEmail(row.Email);
        } catch (e) {
            await ForgetPassword.deleteByEmail(row.Email);
        }
    }
}

exports.forgetPassword = async (req, res, next) => {
    try {
        const email = req.body.email;

        const token = jwt.sign({
            email,
            exp: Math.floor(Date.now() / 1000) + (60 * 60),
            random: Math.floor(Math.random() * 1000000)
        }, process.env.BCRYPT_SALT);

        await deleteAllTimeExceed(ForgetPassword);
        await ForgetPassword.deleteByEmail(email);

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
