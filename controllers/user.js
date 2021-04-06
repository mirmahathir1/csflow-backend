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

exports.viewMyProfile = async(req, res,next)=>{
    try{
        let user = res.locals.middlewareResponse.user;
        return res.status(200).send(new SuccessResponse("OK",200,"Fetched user successfully",user));
    }catch (e){
        next(e);
    }
};