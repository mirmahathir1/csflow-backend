const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const User = require('../models/user');

const {validationResult} = require('express-validator');
const {ErrorHandler}= require('../response/error')
const {SuccessResponse} = require('../response/success')

let handlePOSTLogIn = async (req, res, next) => {

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

            let token = jwt.sign({id:user.id}, process.env.BCRYPT_SALT);

            await user.saveToken(token);

            return res.status(201).send(new SuccessResponse("OK",201,"Successfully signed in",token));
        } else {
            return res.status(401).send(new ErrorHandler(401,'Incorrect email / password'));
        }
    } catch (e) {
        return res.status(500).send(new ErrorHandler(500,e.message));
    }
};

let handleAuthentication = async (req, res, next) => {
    let decodedUser;
    let token = req.header('x-auth');

    if(!token){
        return res.status(401).send(new ErrorHandler(401,'Authentication header not found'))
    }

    try {

        decodedUser = await jwt.verify(token, process.env.BCRYPT_SALT);
    }catch (e){
        return res.status(401).send(new ErrorHandler(401,"Malformed JWT token"));
    }

    try {
        let user = await User.findByToken(token);

        if (!user) {
            return res.status(401).send(new ErrorHandler(401,"Invalid user"));
        }

        res.locals.middlewareResponse = {
            user,
            token
        };
        return next();

    } catch (e) {
        return res.status(500).send(new ErrorHandler(500,e.message));
    }
};



module.exports = {
    handlePOSTLogIn,
    handleAuthentication,
}
