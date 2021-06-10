const Resourcearchive = require('../models/resourcearchive');
const Thesisarchive = require('../models/thesisarchive');
const ThesisOwner = require('../models/thesisowner');
const Projectarchive = require('../models/projectarchive');
const Projectowner = require('../models/projectowner');
const Coursedetails = require('../models/coursedetails');
const Batch = require('../models/batch');
const User = require('../models/user');
const Tag = require('../models/tag');
const Report = require('../models/report');
const Post = require('../models/post');
const Answer = require('../models/answer');
const Comment = require('../models/comment');
//const Admin = require('../models/admin');
const {validationResult} = require('express-validator');
const {ErrorHandler} = require('../response/error');
const {SuccessResponse} = require('../response/success');

exports.getAllUsers = async (req,res,next) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            throw new ErrorHandler(400, errors.errors[0].msg, errors);
        }
        let batchid = req.params.batchNumber;
        let userDetails = await User.getUserDetailsByBatchID(batchid);
        if (userDetails.length === 0) {
            throw new ErrorHandler(404, "No batch found", null);
        }
        return res.status(200).send(new SuccessResponse("OK", 200, "List of users fetched successfully", userDetails));
    }catch (e) {
        next(e);
    }
};
exports.updateLevelTerm = async (req,res,next) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            throw new ErrorHandler(400, errors.errors[0].msg, errors);
        }
        let batchid = req.params.batchNumber;
        let userDetails = await User.getUserDetailsByBatchID(batchid);
        if (userDetails.length === 0) {
            throw new ErrorHandler(404, "No students of specified batch found", null);
        }
        let i;
        let level = req.body.level;
        let term = req.body.term;
        if(level < 1 || level > 4 || term < 1 || term > 2){
            throw new ErrorHandler(404, "Invalid level/ term", null);
        }
        for(i=0;i<userDetails.length;i++){
            await User.updateLevelTerm(userDetails[i].studentId,level,term);
        }

        return res.status(200).send(new SuccessResponse("OK", 200, "Promotion of all users’s of specified batch successful", null));
    }catch (e) {
        next(e);
    }
};
exports.deleteUser = async (req,res,next) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            throw new ErrorHandler(400, errors.errors[0].msg, errors);
        }
        let userid = req.params.userId;

        if (await User.isUser(userid) === false) {
            throw new ErrorHandler(404, "user not found", null);
        }
        await User.deleteUser(userid);
        return res.status(200).send(new SuccessResponse("OK", 200, "Deletion of user successful", null));
    }catch (e) {
        next(e);
    }
};
exports.getAllPrivilegedUsers = async (req,res,next) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            throw new ErrorHandler(400, errors.errors[0].msg, errors);
        }
        let batchid = req.params.batchNumber;
        let userDetails = await User.getUserDetailsByBatchID(batchid);
        if (userDetails.length === 0) {
            throw new ErrorHandler(404, "No batch found", null);
        }
        let i;
        let CR = [];
        for(i=0;i<userDetails.length;i++){
            let isCR = await User.isPrivilegedUser(userDetails[i].studentId);
            if(isCR.CR === 1){
                CR.push(userDetails[i]);
            }
        }
        if(CR.length === 0){
            throw new ErrorHandler(404, "No privileged user of specified batch found", null);
        }
        return res.status(200).send(new SuccessResponse("OK", 200, "List of privileged users fetched successfully", CR));
    }catch (e) {
        next(e);
    }
};
exports.updateCR = async (req,res,next) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            throw new ErrorHandler(400, errors.errors[0].msg, errors);
        }
        let userid = req.params.userId;
        if (await User.isUser(userid) === false) {
            throw new ErrorHandler(404, "user not found", null);
        }
        //let userDetails = await User.getUserDetailsByUserID(userid);
        let flag = req.body.promote;
        if(flag !== true && flag !== false){
            throw new ErrorHandler(401, "Miswritten/ missing fields in request", null);
        }
        if(flag === true){
            let isCR = await User.isPrivilegedUser(userid);
            if(isCR.CR === 1){
                throw new ErrorHandler(400, "The user is already a privileged user", null);
            }else{
                await User.updateCR(userid,1);
            }
        }else{
            let isCR = await User.isPrivilegedUser(userid);
            if(isCR.CR !== 1){
                throw new ErrorHandler(400, "The user is not a privileged user", null);
            }else{
                await User.updateCR(userid,0);
            }
        }

        return res.status(200).send(new SuccessResponse("OK", 200, "Specified user has been promoted", null));
    }catch (e) {
        next(e);
    }
};
exports.deleteThesis = async (req,res,next) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            throw new ErrorHandler(400, errors.errors[0].msg, errors);
        }
        let thesis = await Thesisarchive.findThesis(req.params.id);
        if (!thesis) {
            throw new ErrorHandler(404, "Thesis not found", null);
        }

        await Thesisarchive.DeleteThesis(req.params.id);

        return res.status(200).send(new SuccessResponse("OK", 200, "Successfully deleted thesis", null));
    } catch (e) {
        next(e);
    }

};
exports.deleteProject = async (req,res,next) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            throw new ErrorHandler(400, errors.errors[0].msg, errors);
        }

        let project = await Projectarchive.findProject(req.params.id);
        if (project.length===0) {
            throw new ErrorHandler(404, "Project not found", null);
        }

        await Projectarchive.DeleteProject(req.params.id);
        return res.status(200).send(new SuccessResponse("OK", 200, "Project deleted successfully", null));
    } catch (e) {
        next(e);
    }

};
exports.getAllCourses = async (req,res,next) => {
    try {
        let payload = await Coursedetails.fetchAllCourse();
        return res.status(200).send(new SuccessResponse("OK", 200, "List of course's fetched successfully", payload));
    } catch (e) {
        next(e);
    }
};

exports.deleteCourse = async (req,res,next) => {
    try {
        let courseArray = req.params.courseId.split("-");
        let courseNumber = courseArray.join(" ");
        let courseID = await Coursedetails.getCourseID(courseNumber);
        if(courseID.length===0){
            throw new ErrorHandler(404,"Course not found",null);
        }
        await Coursedetails.deleteCourse(courseNumber);
        await Tag.deleteTag(courseID[0].CourseTagID);
        return res.status(200).send(new SuccessResponse("OK", 200, "Course deletion successful", null));
    } catch (e) {
        next(e);
    }
};
exports.createCourse = async (req,res,next) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            throw new ErrorHandler(400, errors.errors[0].msg, errors);
        }
        let courseId = req.body.courseId;
        let level = req.body.level;
        let term = req.body.term;
        let title = req.body.title;
        let batch = req.body.batch;
        if(level < 1 || level > 4 || term < 1 || term > 2){
            throw new ErrorHandler(404, "Invalid level/ term", null);
        }
        let row = await Tag.getMaxID();

        let count = Object.values(row);
        let tagId = count[0] + 1;
        await Tag.addTag(tagId,'course',title);
        await Coursedetails.createCourse(courseId,title,level,term,batch,tagId);
        return res.status(200).send(new SuccessResponse("OK", 200, "Course creation successful", null));
    } catch (e) {
        next(e);
    }
};
exports.updateCourse = async (req,res,next) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            throw new ErrorHandler(400, errors.errors[0].msg, errors);
        }

        let courseArray = req.params.courseId.split("-");
        let courseNumber = courseArray.join(" ");
        let courseID = await Coursedetails.getCourseID(courseNumber);
        if(courseID.length===0){
            throw new ErrorHandler(404,"Course not found",null);
        }
        let level = req.body.level;
        let term = req.body.term;
        let title = req.body.title;

        if(level < 1 || level > 4 || term < 1 || term > 2){
            throw new ErrorHandler(404, "Invalid level/ term", null);
        }

        await Tag.updateTags(courseID[0].CourseTagID,'course',title);
        await Coursedetails.updateCourse(courseNumber,level,term,title);
        return res.status(200).send(new SuccessResponse("OK", 200, "Course updated successfully", null));
    } catch (e) {
        next(e);
    }
};