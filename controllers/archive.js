const Resourcearchive = require('../models/resourcearchive');
const {validationResult} = require('express-validator');
const {ErrorHandler} = require('../response/error');
const {SuccessResponse} = require('../response/success');
exports.getAllDriveLinks = async(req, res,next)=>{
    try{
        let resourcearchive = Resourcearchive.fetchAll();

        resourcearchive.then(function (result) {
           /* if(!result){
                throw new ErrorHandler(404,"Archive not found");
            }*/
            return res.status(200).send(new SuccessResponse("OK", 200, "Fetched drive links successfully", result));
        })

       // return res.status(200).send(new SuccessResponse("OK",200,"Fetched drive links successfully",resourcearchive));
    }catch (e){
        next(e);
    }
};