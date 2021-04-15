const Resourcearchive = require('../models/resourcearchive');
const Thesisarchive = require('../models/thesisarchive');
const ThesisOwner = require('../models/thesisowner');
const Batch = require('../models/batch');
const User = require('../models/user');
const {validationResult} = require('express-validator');
const {ErrorHandler} = require('../response/error');
const {SuccessResponse} = require('../response/success');

exports.getBatchList = async (req, res, next) => {
    try {
        let batches = await Batch.getBatches();

        if (batches.length === 0) {
            throw new ErrorHandler(404, "There is no batch currently", null);
        }

        return res.status(200).send(new SuccessResponse("OK", 200, "List of batches fetched successfully", batches));
    } catch (e) {
        next(e);
    }
};
exports.getAllDriveLinks = async (req, res, next) => {
    try {
        let finalCollectionOfDriveLinks = [];
        let rawBatches = await Batch.getBatches();
        let batches = [];

        rawBatches.forEach((rawBatch)=>{
            batches.push(Object.values(rawBatch));
        })

        let k;
        for (k = 0; k < batches.length; k++) {
            let batch_no = batches[k][0];

            let rawResources = await Resourcearchive.getResourcesByBatchID(batch_no);

            if (rawResources.length === 0) {
                throw new ErrorHandler(404, "Archive not found", null);
                //return res.status(200).send(new SuccessResponse("OK", 200, "Fetched drive links successfully", null));
            }

            finalCollectionOfDriveLinks.push({
                batch: batch_no,
                resources: rawResources
            });
        }
        return res.status(200).send(new SuccessResponse("OK", 200, "Fetched drive links successfully", finalCollectionOfDriveLinks));
    } catch (e) {
        next(e);
    }
};

exports.getThesisByBatchID = async (req, res, next) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            throw new ErrorHandler(400, errors.errors[0].msg, errors);
        }
        let thesisTitles = await Thesisarchive.getThesisTitleByBatchID(req.params.batchNumber);

        if (thesisTitles.length === 0) {
            throw new ErrorHandler(404, "Batch not found", null);
        }

        return res.status(200).send(new SuccessResponse("OK", 200, "List of theses fetched successfully", thesisTitles));
    } catch (e) {
        next(e);
    }
};

exports.getThesisDetailsByThesisID = async (req, res, next) => {
    try {
        let theses = await Thesisarchive.findDetailsByThesisID(req.params.id);

        if (theses.length === 0) {
            throw new ErrorHandler(404, "Thesis not found", null);
        }


        let i;
        let owners = [];
        for (i = 0; i < theses.length; i++) {

            let userid = theses[i].UserID;
            let user = await User.getUserDetailsByUserID(userid);
            owners.push(user);
        }

        let rawComments = await Thesisarchive.findCommentsByThesisID(req.params.id);
        let firstThesis = theses[0];
        let array = firstThesis.Authors.split(",");
        let comments = [];

        let k;

        for (k = 0; k < rawComments.length; k++) {
            let singleComment = rawComments[k];
            comments.push({
                id: singleComment.CID,
                comment: singleComment.Description,
                name: singleComment.Name,
                studentID: singleComment.UID,
                timestamp: singleComment.Date
            });
        }

        let Details = {
            title: firstThesis.Title,
            writers: array,
            description: firstThesis.Abstract,
            owners: owners,
            comments: comments
        };

        return res.status(200).send(new SuccessResponse("OK", 200, "Details of thesis fetched successfully", Details));
    } catch (e) {
        next(e);
    }
};
exports.postThesis = async (req, res, next) => {
    try {

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
            throw new ErrorHandler(400, "Missing/ miswritten fields in request", null);
        }

        let i, j;
        for (i = 0; i < owners.length; i++) {

            if (typeof owners[i] != "number") {
                throw new ErrorHandler(400, "Missing/ miswritten fields in request", null);
            }
        }

        for (j = 0; j < Writers.length; j++) {

            if (typeof Writers[j] != "string") {
                throw new ErrorHandler(400, "Missing/ miswritten fields in request", null);
            }
        }

        for (i = 0; i < owners.length; i++) {
            // let row2 = await User.isUser(owners[i]);
            if (!await User.isUser(owners[i])) {
                throw new ErrorHandler(404, "Student ID not found", null);
            }
        }
        let row = await Thesisarchive.getMaxID();

        let count = Object.values(row);
        let id = count[0] + 1;

        //batchID,title,authors,abstract,link,owners
        await Thesisarchive.create(id, batchid, title, writers, description, link);
        let k;

        for (k = 0; k < owners.length; k++) {
            await ThesisOwner.create(id, owners[k]);
        }

        return res.status(201).send(new SuccessResponse("OK", 201, "Thesis created Successfully", null));
    } catch (e) {
        next(e);
    }
};
exports.deleteThesis = async (req, res, next) => {
    try {
        let user = res.locals.middlewareResponse.user;

        let userid = user.id;
        let thesis = await Thesisarchive.findThesis(req.params.id);
        if (!thesis) {
            throw new ErrorHandler(404, "Thesis not found", null);
        }
        let auth = await Thesisarchive.userAuthorization(req.params.id, userid);

        if (!auth) {
            throw new ErrorHandler(401, "User is unauthorized to delete this thesis", null);
        }

        await Thesisarchive.DeleteThesis(req.params.id);

        return res.status(200).send(new SuccessResponse("OK", 200, "Successfully deleted thesis", null));
    } catch (e) {
        next(e);
    }
};
exports.editThesis = async (req, res, next) => {
    try {
        let user = res.locals.middlewareResponse.user;
        let batchid = user.batchID;
        let userid = user.id;
        let title = req.body.title;
        let Writers = req.body.writers;


        let writers = Writers.join(",");
        let description = req.body.description;
        let link = req.body.link;
        let owners = req.body.owners;
        const errors = validationResult(req);

        if (!errors.isEmpty()) {
            throw new ErrorHandler(400, "Missing/ miswritten fields in request", null);
        }

        let i, j;
        for (i = 0; i < owners.length; i++) {

            if (typeof owners[i] != "number") {
                throw new ErrorHandler(400, "Missing/ miswritten fields in request", null);
            }
        }

        for (j = 0; j < Writers.length; j++) {

            if (typeof Writers[j] != "string") {
                throw new ErrorHandler(400, "Missing/ miswritten fields in request", null);
            }
        }
        let thesis = await Thesisarchive.findThesis(req.params.id);
        if (!thesis) {
            throw new ErrorHandler(404, "Thesis not found", null);
        }

        let auth = await Thesisarchive.userAuthorization(req.params.id, userid);
        if (!auth) {
            throw new ErrorHandler(401, "User is unauthorized to edit this thesis", null);
        }
        for (i = 0; i < owners.length; i++) {
            if (!await User.isUser(owners[i])) {
                throw new ErrorHandler(404, "Student ID not found", null);
            }
        }


        await Thesisarchive.update(req.params.id, batchid, title, writers, description, link);


        return res.status(200).send(new SuccessResponse("OK", 200, "Thesis edited Successfully", null));
    } catch (e) {
        next(e);
    }
};