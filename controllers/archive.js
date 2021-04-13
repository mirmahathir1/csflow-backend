const Resourcearchive = require('../models/resourcearchive');
const Thesisarchive = require('../models/thesisarchive');
const {validationResult} = require('express-validator');
const {ErrorHandler} = require('../response/error');
const {SuccessResponse} = require('../response/success');

exports.getAllDriveLinks = async(req, res,next)=>{
    try{
        let resourcearchive = await Resourcearchive.fetchAll();

       /* resourcearchive.then(function (result) {
           /* if(!result){
                throw new ErrorHandler(404,"Archive not found");
            }
            return res.status(200).send(new SuccessResponse("OK", 200, "Fetched drive links successfully", result));
        }) */

       return res.status(200).send(new SuccessResponse("OK",200,"Fetched drive links successfully",resourcearchive));
    }catch (e){
        next(e);
    }
};

exports.getThesisByBatchID = async(req, res,next)=>{
    try{
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            throw new ErrorHandler(400,errors);
        }
        let thesisarchive = await Thesisarchive.findByBatchID(req.params.batchNumber);
        if(!thesisarchive){
            throw new ErrorHandler(404,"Batch not found");
        }
        return res.status(200).send(new SuccessResponse("OK",200,"List of theses fetched successfully",thesisarchive));
    }catch (e){
        next(e);
    }
};