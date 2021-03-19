const User = require('../models/user');

const {validationResult} = require('express-validator');
const {ErrorHandler} = require('../response/error');
const {SuccessResponse} = require('../response/success');

exports.viewProfile = async (req, res, next) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            throw new ErrorHandler(400,errors);
        }

        let user = await User.findById(req.params.userId);

        if(!user){
            throw new ErrorHandler(404,"User not found");
        }

        return res.status(200).send(new SuccessResponse("OK",200,"Fetched user successfully",user));
    }catch (e){
        next(e);
    }
};

exports.logOut = async (req, res, next) => {
    try {
        let user = res.locals.middlewareResponse.user;
        let token = res.locals.middlewareResponse.token;

        await user.deleteToken(token);

        return res.status(200).send(new SuccessResponse("OK",200,"Logged out successfully",null));
    } catch (e) {
        next(e);
    }
};

exports.logOutAllDevices = async (req, res, next) =>{
    try{
        let user = res.locals.middlewareResponse.user;

        await user.deleteAllTokens();

        return res.status(200).send(new SuccessResponse("OK",200,"Logged out of all devices successfully",null));

    }catch (e) {
        next(e);
    }
}
