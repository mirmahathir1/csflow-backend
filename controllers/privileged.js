const Resourcearchive = require('../models/resourcearchive');
const Thesisarchive = require('../models/thesisarchive');
const ThesisOwner = require('../models/thesisowner');
const Projectarchive = require('../models/projectarchive');
const Projectowner = require('../models/projectowner');
const Coursedetails = require('../models/coursedetails');
const Batch = require('../models/batch');
const User = require('../models/user');
const Tag = require('../models/tag');
const {validationResult} = require('express-validator');
const {ErrorHandler} = require('../response/error');
const {SuccessResponse} = require('../response/success');

exports.getUsers = async (req, res, next) => {
    try {
        let user = res.locals.middlewareResponse.user;

        let batchid = user.batchID;
        let userDetails = await User.getUserDetailsByBatchID(batchid);
        if (userDetails.length === 0) {
            throw new ErrorHandler(404, "There is no user of this batch currently", null);
        }

        return res.status(200).send(new SuccessResponse("OK", 200, "List of users fetched successfully", userDetails));
    } catch (e) {
        next(e);
    }
};
exports.getCourseTags = async (req,res,next) => {
    try {
        let user = res.locals.middlewareResponse.user;
        let batchid = user.batchID;
        let payload = [];
        let courseTagDetails = await Tag.getCourseTags(batchid);
        if(courseTagDetails.length===0){
            throw new ErrorHandler(404, "There is no courseTag of this batch", null);
        }
        let i;
        for(i=0;i<courseTagDetails.length;i++){
            payload.push(courseTagDetails[i].Name);
        }
        return res.status(200).send(new SuccessResponse("OK", 200, "List of CourseTags fetched successfully", payload));
    }catch (e) {
        next(e);
    }
}
exports.getAllTags = async (req,res,next) => {
    try{
        let user = res.locals.middlewareResponse.user;
        let batchid = user.batchID;
        let payload = [];
        let courseTagDetails = await Tag.getCourseTags(batchid);
        if(courseTagDetails.length===0){
            throw new ErrorHandler(404, "There is no courseTag of this batch", null);
        }
        let i;
        for(i=0;i<courseTagDetails.length;i++){
            let topics = [];
            let books = [];
            let relatedTagDetails = await Tag.getRelatedTags(courseTagDetails[i].ID);
            let j;
            for(j=0;j<relatedTagDetails.length;j++){
                if(relatedTagDetails[j].Type.toLowerCase() === 'topic'){
                    topics.push({
                        id : relatedTagDetails[j].ID,
                        name : relatedTagDetails[j].Name
                    });
                }
                else if(relatedTagDetails[j].Type.toLowerCase() === 'book'){
                    books.push({
                        id : relatedTagDetails[j].ID,
                        name : relatedTagDetails[j].Name
                    });
                }
            }
            let tagObject = {
                courseId : courseTagDetails[i].Name,
                books : books,
                topics : topics
            };
            payload.push(tagObject);
        }
        return res.status(200).send(new SuccessResponse("OK", 200, "List of Tags fetched successfully", payload));
    }catch (e) {
        next(e);
    }
}
exports.acceptRequestedTag = async (req,res,next) =>{
    try{
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            throw new ErrorHandler(400, errors.errors[0].msg, errors);
        }
        let user = res.locals.middlewareResponse.user;
        let batchid = user.batchID;
        let requestedTagDetails = await Tag.getRequestedTags(req.params.id);
        if(requestedTagDetails.length===0){
            throw new ErrorHandler(404, "Tag not found", null);
        }
        let BatchID = await Coursedetails.findBatchID(requestedTagDetails[0].CourseTagID);
        if(BatchID.BatchID != batchid){
            throw new ErrorHandler(401, "You must be enrolled to this course to accept this tag", null);
        }
        let maxTagID = await Tag.getMaxID();
        let count = Object.values(maxTagID);
        let tagid = count[0] + 1;
        await Tag.addTag(tagid,requestedTagDetails[0].Type,requestedTagDetails[0].Name);
        await Tag.addRelatedTag(requestedTagDetails[0].CourseTagID,tagid);
        return res.status(200).send(new SuccessResponse("OK", 200, "Tag accepted Successfully", null));
    }catch(e){
        next(e);
    }
}
exports.createTag = async (req,res,next) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            throw new ErrorHandler(400, errors.errors[0].msg, errors);
        }
        let user = res.locals.middlewareResponse.user;
        let batchid = user.batchID;
        let type1 = req.body.type;
        let type = type1.toLowerCase();
        let name = req.body.name;

        if(type!=='topic' && type!=='book'){
            throw new ErrorHandler(400, "Invalid tag type", null);
        }
        let courseName = req.body.courseId;
        let course = await Coursedetails.getCourseID(courseName);
        if(course.length===0){
            throw new ErrorHandler(404, "Course not found", null);
        }

        let BatchID = await Coursedetails.findBatchID(course[0].CourseTagID);
        if(BatchID.BatchID != batchid){
            throw new ErrorHandler(401, "You must be enrolled to this course to create this tag", null);
        }

        let maxTagID = await Tag.getMaxID();
        let count = Object.values(maxTagID);
        let tagid = count[0] + 1;
        await Tag.addTag(tagid,type,name);
        await Tag.addRelatedTag(course[0].CourseTagID,tagid);
        return res.status(200).send(new SuccessResponse("OK", 200, "Tag created Successfully", null));

    }catch (e) {
        next(e);
    }
}
exports.updateTag = async (req,res,next) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            throw new ErrorHandler(400, errors.errors[0].msg, errors);
        }
        let user = res.locals.middlewareResponse.user;
        let batchid = user.batchID;
        let type1 = req.body.type;
        let type = type1.toLowerCase();
        let name = req.body.name;
        let tag = await Tag.findTagbyID(req.params.id);
        if(tag.length===0){
            throw new ErrorHandler(404, "Tag not found", null);
        }
        if(type!=='topic' && type!=='book' && type!=='course'){
            throw new ErrorHandler(400, "Invalid tag type", null);
        }
        let courseTag = await Tag.findCourseTag(tag[0].ID);
        if(courseTag.length===0){
            throw new ErrorHandler(404, "CourseTag not found", null);
        }
        let BatchID = await Coursedetails.findBatchID(courseTag[0].CourseTagID);
        if(BatchID.BatchID != batchid){
            throw new ErrorHandler(401, "You must be enrolled to this course to edit this tag", null);
        }
        let courseName = req.body.courseId;
        let course = await Coursedetails.getCourseID(courseName);
        if(course.length===0){
            throw new ErrorHandler(404, "Course not found", null);
        }
        await Tag.updateTags(req.params.id,type,name);
        return res.status(200).send(new SuccessResponse("OK", 200, "Tag edited Successfully", null));

    }catch (e){
        next(e);
    }
}
exports.deleteTag = async (req,res,next) =>{
    try{
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            throw new ErrorHandler(400, errors.errors[0].msg, errors);
        }
        let user = res.locals.middlewareResponse.user;
        let batchid = user.batchID;
        let tag = await Tag.findTagbyID(req.params.id);
        if(tag.length===0){
            throw new ErrorHandler(404, "Tag not found", null);
        }
        let courseTag = await Tag.findCourseTag(tag[0].ID);
        let BatchID = await Coursedetails.findBatchID(courseTag[0].CourseTagID);
        if(BatchID.BatchID != batchid){
            throw new ErrorHandler(401, "You must be enrolled to this course to delete this tag", null);
        }
        await Tag.deleteTag(req.params.id);
        return res.status(200).send(new SuccessResponse("OK", 200, "Tag deleted Successfully", null));
    }catch (e){
        next(e);
    }

}