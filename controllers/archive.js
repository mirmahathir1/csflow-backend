const Resourcearchive = require('../models/resourcearchive');
const Thesisarchive = require('../models/thesisarchive');
const Batch = require('../models/batch');
const User = require('../models/user');
const {validationResult} = require('express-validator');
const {ErrorHandler} = require('../response/error');
const {SuccessResponse} = require('../response/success');

exports.getBatchList = async(req,res,next)=>{
    try {
        let batchlist = await Batch.findBatchList();
        return res.status(200).send(new SuccessResponse("OK",200,"List of batches fetched successfully",batchlist));
    }catch (e) {
        next(e);
    }
};
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
            throw new ErrorHandler(400,errors.errors[0].msg,errors);
        }
        let thesisarchive = await Thesisarchive.findByBatchID(req.params.batchNumber);
        if(!thesisarchive){
            throw new ErrorHandler(404,"Batch not found",null);
        }
        return res.status(200).send(new SuccessResponse("OK",200,"List of theses fetched successfully",thesisarchive));
    }catch (e){
        next(e);
    }
};

exports.getThesisDetailsByThesisID = async(req, res,next)=>{
    try{
        /*const errors = validationResult(req);
        if (!errors.isEmpty()) {
            throw new ErrorHandler(400,errors.errors[0].msg,errors);
        }*/
        let thesisarchive = await Thesisarchive.getThesisDetailsById(req.params.id);
        if(!thesisarchive){
            throw new ErrorHandler(404,"Thesis not found",null);
        }
        return res.status(200).send(new SuccessResponse("OK",200,"Details of thesis fetched successfully",thesisarchive));
    }catch (e){
        next(e);
    }
};
exports.postThesis = async(req,res,next)=>{
    try{

        let user = res.locals.middlewareResponse.user;
        let batchid = user.batchID;

        let title = req.body.title;
        let Writers = req.body.writers;

        let writers = Writers.join(",");
        let description = req.body.description;
        let link = req.body.link;
        let owners = req.body.owners;
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            throw new ErrorHandler(400,"Missing/ miswritten fields in request",null);
        }
        let i,j;
        for(i=0;i<owners.length;i++){

            if(typeof owners[i]!="number"){
                throw new ErrorHandler(400,"Missing/ miswritten fields in request",null);
            }
        }
        for(j=0;j<Writers.length;j++){

            if(typeof Writers[j]!="string"){
                throw new ErrorHandler(400,"Missing/ miswritten fields in request",null);
            }
        }
        let response = await Thesisarchive.saveThesis(batchid,title,writers,description,link,owners);
        if(!response){
            throw new ErrorHandler(400,"Student ID not found",null);
        }
        return res.status(201).send(new SuccessResponse("OK",201,"Thesis created Successfully",null));
    }catch (e) {
        next(e);
    }
};