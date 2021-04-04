const {SuccessResponse} = require('../response/success');

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
