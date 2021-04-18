const User = require('../models/user');

const {validationResult} = require('express-validator');
const {ErrorHandler} = require('../response/error');
const {SuccessResponse} = require('../response/success');
const storage = require('../storage/storage');


exports.viewProfile = async (req, res, next) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            throw new ErrorHandler(400, errors);
        }

        let user = await User.findById(req.params.userId);

        if (!user)
            throw new ErrorHandler(404, "User not found");
        // deleting password field
        delete user.password;
        //console.log(user);
        return res.status(200).send(new SuccessResponse("OK", 200, "Fetched user successfully", user));
    } catch (e) {
        next(e);
    }
};

exports.viewMyProfile = async (req, res, next) => {
    try {
        let user = res.locals.middlewareResponse.user;
        // deleting password field
        delete user.password;
        //console.log(user.batchID);
        return res.status(200).send(new SuccessResponse("OK", 200, "Fetched user successfully", user));
    } catch (e) {
        next(e);
    }
};

exports.deleteProfile = async (req, res, next) => {
    try {
        let user = res.locals.middlewareResponse.user;
        await user.deleteMe();
        return res.status(200).send(new SuccessResponse("OK", 200,
            "Account deletion successful", null));
    } catch (e) {
        next(e);
    }
};

exports.changeProfile = async (req, res, next) => {
    try {
        let user = res.locals.middlewareResponse.user;
        // await user.deleteMe();
        return res.status(200).send(new SuccessResponse("OK", 200,
            "NOt implemented", null));
    } catch (e) {
        next(e);
    }
};

exports.uploadProfilePic = async (req, res, next) => {
    try {
        if(!req.file)
            return res.status(400).send(new ErrorHandler(400, "No file received"));

        const imageLink = await storage.uploadAnImage(req.file, "profile-pic");

        let user = res.locals.middlewareResponse.user;
        await user.saveProfilePicLink(imageLink);
        //console.log("send")
        return res.status(200).send(new SuccessResponse("OK", 200,
            "Edit successful", null));
    } catch (e) {
        next(e);
    }
};

