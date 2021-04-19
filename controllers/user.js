const User = require('../models/user');

const {validationResult} = require('express-validator');
const {ErrorHandler} = require('../response/error');
const {SuccessResponse} = require('../response/success');
const {uploadAnImage} = require('../storage/storage');
const {deleteImage} = require('../storage/cleanup');


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

exports.updateName = async (req, res, next) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty())
            throw new ErrorHandler(400, errors);

        let user = res.locals.middlewareResponse.user;
        await user.updateName(req.body.name);

        return res.status(200).send(new SuccessResponse("OK", 200,
            "Edit successful", null));
    } catch (e) {
        next(e);
    }
};

exports.uploadProfilePic = async (req, res, next) => {
    try {
        if(!req.file)
            return res.status(400).send(new ErrorHandler(400, "No file received"));

        const imageLink = await uploadAnImage(req.file, "profile-pic");

        let user = res.locals.middlewareResponse.user;
        // console.log();
        if (!user) {
            return res.status(401).send(new ErrorHandler(401, "Invalid user"));
        }
        await user.saveProfilePicLink(imageLink);

        await deleteImage(user.profilePic);
        //console.log("send")
        return res.status(200).send(new SuccessResponse("OK", 200,
            `Uploaded mage successfully. New Image link ${imageLink}`, null));
    } catch (e) {
        next(e);
    }
};

