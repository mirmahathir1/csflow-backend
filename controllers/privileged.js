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
        await Tag.updateRelatedTags(req.params.id,course[0].CourseTagID);
        if(type==='course'){
            await Coursedetails.updateCourseNumber(req.params.id,name);
        }
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
exports.getRequestedTags = async (req,res,next) => {
    try {
        let requestedTagDetails = await Tag.findRequestedTags();
        if(requestedTagDetails.length===0){
            throw new ErrorHandler(404, "Requested tags not found", null);
        }
        let payload = [];
        let i;
        for(i=0;i<requestedTagDetails.length;i++){
            let courseNumber = await Coursedetails.findCourseNumber(requestedTagDetails[i].CourseTagID);
            payload.push({
                id : requestedTagDetails[i].ID,
                name : requestedTagDetails[i].Name,
                type : requestedTagDetails[i].Type,
                courseId : courseNumber.CourseNo,
                requester : requestedTagDetails[i].RequesterID
            });
        }
        return res.status(200).send(new SuccessResponse("OK", 200, "Requested tags fetched Successfully", payload));

    }catch (e) {
        next(e);
    }
}
exports.updateRequestedTag = async (req,res,next) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            throw new ErrorHandler(400, errors.errors[0].msg, errors);
        }

        let type1 = req.body.type;
        let type = type1.toLowerCase();
        let name = req.body.name;
        let tag = await Tag.findRequestedTagbyID(req.params.id);
        if(tag.length===0){
            throw new ErrorHandler(404, "Tag not found", null);
        }
        if(type!=='topic' && type!=='book' && type!=='course'){
            throw new ErrorHandler(400, "Invalid tag type", null);
        }

        let courseName = req.body.courseId;
        let course = await Coursedetails.getCourseID(courseName);
        if(course.length===0){
            throw new ErrorHandler(404, "Course not found", null);
        }
        await Tag.updateRequestedTag(req.params.id,type,name);
        return res.status(200).send(new SuccessResponse("OK", 200, "Tag edited Successfully", null));

    }catch (e){
        next(e);
    }
}
exports.deleteRequestedTag = async (req,res,next) => {
    try{
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            throw new ErrorHandler(400, errors.errors[0].msg, errors);
        }

        let tag = await Tag.findRequestedTagbyID(req.params.id);
        if(tag.length===0){
            throw new ErrorHandler(404, "Tag not found", null);
        }
        await Tag.deleteRequestedTag(req.params.id);
        return res.status(200).send(new SuccessResponse("OK", 200, "Tag deleted Successfully", null));
    }catch (e){
        next(e);
    }
}

exports.getReportedPosts = async (req,res,next) => {
    try {
        let user = res.locals.middlewareResponse.user;
        let batchid = user.batchID;
        let payload = [];
        let reportedPostIDs = await Report.getReportedPostID();
        if(reportedPostIDs.length===0){
            return res.status(200).send(new SuccessResponse("OK", 200, "There is no reported post", null));
        }
        let i;
        let validPostIDs = [];
        for(i=0;i<reportedPostIDs.length;i++){
            let courseName = await Post.getCourseNumberofPost(reportedPostIDs[i].PostID);
            let array = await Coursedetails.getCourseID(courseName[0].courseName);
            let batchID = array[0].BatchID;
            if(batchID === batchid){
                validPostIDs.push(reportedPostIDs[i].PostID);
            }
        }
        let j;
        if(validPostIDs.length===0){
            return res.status(200).send(new SuccessResponse("OK", 200, "There is no reported post", null));
        }
        for(j=0;j<validPostIDs.length;j++){
            let postDetails = await Post.getPostDetails(validPostIDs[j]);
            let userDetails = await User.getUserDetailsByUserID(postDetails.UserID);
            let tagNames = await Post.getPostTags(validPostIDs[j]);
            let k,Topic="",Book="";
            let customTags = [];
            for(k=0;k<tagNames.length;k++){
                let tagType = await Tag.getTagType(tagNames[k].Name);
                if(tagType.length===0){
                    customTags.push(tagNames[k].Name);
                }
                else if(tagType[0].Type === 'topic'){
                    Topic=tagNames[k].Name;
                }
                else if(tagType[0].Type === 'book'){
                    Book=tagNames[k].Name;
                }

            }
            payload.push({
                postId : validPostIDs[j],
                owner : {
                    name : userDetails.Name,
                    studentId : userDetails.ID,
                    profilePic : userDetails.ProfilePic,
                    karma : userDetails.Karma

                },
                type : postDetails.Type,
                createdAt : postDetails.Date,
                vote : postDetails.UpvoteCount-postDetails.DownvoteCount,
                course : postDetails.courseName,
                topic : Topic,
                book : Book,
                termFinal : {
                    level : postDetails.level,
                    term : postDetails.term
                },
                customTag : customTags,
                title : postDetails.Title
            });

        }
        return res.status(200).send(new SuccessResponse("OK", 200, "Reported posts fetched successfully", payload));

    }catch (e) {
        next(e);
    }
}
exports.resolveReports = async (req,res,next) => {
    try {
        let user = res.locals.middlewareResponse.user;
        let batchid = user.batchID;
        let courseName = await Post.getCourseNumberofPost(req.params.id);
        if(courseName.length === 0){
            throw new ErrorHandler(404, "Post not found", null);
        }
        let isReport = await Report.isReportedPost(req.params.id);
        if(isReport.length===0){
            throw new ErrorHandler(404, "There is no report related to this post", null);
        }

        let array = await Coursedetails.getCourseID(courseName[0].courseName);
        let batchID = array[0].BatchID;
        if(batchID !== batchid){
            throw new ErrorHandler(401, "You are not enrolled in the related course to resolve this report", null);
        }
        await Report.deleteReport(req.params.id);
        return res.status(200).send(new SuccessResponse("OK", 200, "Report has been resolved successfully", null));
    }catch (e) {
        next(e);
    }
}
exports.getReportedAnswers = async (req,res,next) => {
    try{
        let user = res.locals.middlewareResponse.user;
        let batchid = user.batchID;
        let payload = [];
        let reportedAnswerIDs = await Report.getReportedAnswerID();
        if(reportedAnswerIDs.length===0){
            return res.status(200).send(new SuccessResponse("OK", 200, "There is no reported answer", null));
        }
        let i,m;
        let reportedPostIDs = [];
        let validPostIDs = [];
        let validAnswerIDs = [];
        for(m=0;m<reportedAnswerIDs.length;m++){
            let relatedPost = await Answer.getPostID(reportedAnswerIDs[m].AnswerID);
            reportedPostIDs.push(relatedPost[0].PostID);

        }
        for(i=0;i<reportedPostIDs.length;i++){
            let courseName = await Post.getCourseNumberofPost(reportedPostIDs[i]);
            let array = await Coursedetails.getCourseID(courseName[0].courseName);
            let batchID = array[0].BatchID;
            if(batchID === batchid){
                validPostIDs.push(reportedPostIDs[i]);
                validAnswerIDs.push(reportedAnswerIDs[i].AnswerID);
            }
        }
        let j;
        if(validPostIDs.length===0){
            return res.status(200).send(new SuccessResponse("OK", 200, "There is no reported answer ", null));
        }
        for(j=0;j<validPostIDs.length;j++) {
            let answerDetails = await Answer.getAnswerDetails(validAnswerIDs[j])
            let postDetails = await Post.getPostDetails(validPostIDs[j]);
            let userDetails = await User.getUserDetailsByUserID(answerDetails.UserID);
            payload.push({
                postId : validPostIDs[j],
                answerId : validAnswerIDs[j],
                owner : {
                    name : userDetails.Name,
                    studentId : userDetails.ID,
                    profilePic : userDetails.ProfilePic,
                    karma : userDetails.Karma

                },
                type : postDetails.Type,
                createdAt : answerDetails.Date,
                vote : answerDetails.UpvoteCount-answerDetails.DownvoteCount,
                termFinal : {
                    level : postDetails.level,
                    term : postDetails.term
                },
                description : answerDetails.Description
            });
        }
        return res.status(200).send(new SuccessResponse("OK", 200, "Reported answers fetched successfully", payload));
    }catch (e) {
        next(e);
    }
}
exports.resolveReportsofAnswer = async (req,res,next) => {
    try {
        let user = res.locals.middlewareResponse.user;
        let batchid = user.batchID;
        let postID = await Answer.getPostID(req.params.id);
        if(postID.length===0){
            throw new ErrorHandler(404, "Answer not found", null);
        }
        let courseName = await Post.getCourseNumberofPost(postID[0].PostID);
        if(courseName.length === 0){
            throw new ErrorHandler(404, "Post not found", null);
        }
        let isReport = await Report.isReportedAnswer(req.params.id);
        if(isReport.length===0){
            throw new ErrorHandler(404, "There is no report related to this answer", null);
        }

        let array = await Coursedetails.getCourseID(courseName[0].courseName);
        let batchID = array[0].BatchID;
        if(batchID !== batchid){
            throw new ErrorHandler(401, "You are not enrolled in the related course to resolve this report", null);
        }
        await Report.deleteReportofAnswer(req.params.id);
        return res.status(200).send(new SuccessResponse("OK", 200, "Report has been resolved successfully", null));
    }catch (e) {
        next(e);
    }
}
exports.resolveReportsofComment = async (req,res,next) => {
    try {
        let user = res.locals.middlewareResponse.user;
        let batchid = user.batchID;
        let postIDofComments = await Comment.getPostID(req.params.id);
        let answerIDofComments = await Comment.getAnswerID(req.params.id);
        if(postIDofComments.length===0 && answerIDofComments.length===0){
            throw new ErrorHandler(404, "Comment not found", null);
        }
        let relatedPostID;
        if(!postIDofComments[0].PostID){
            let postID = await Answer.getPostID(answerIDofComments[0].AnswerID);
            /*if(postID.length===0){
            throw new ErrorHandler(404, "Answer not found", null);
             }*/
            relatedPostID=postID[0].PostID;
        }
        else{
            relatedPostID=postIDofComments[0].PostID;
        }
        let courseName = await Post.getCourseNumberofPost(relatedPostID);
        if(courseName.length === 0){
            throw new ErrorHandler(404, "Post not found", null);
        }
        let isReport = await Report.isReportedComment(req.params.id);
        if(isReport.length===0){
            throw new ErrorHandler(404, "There is no report related to this comment", null);
        }

        let array = await Coursedetails.getCourseID(courseName[0].courseName);
        let batchID = array[0].BatchID;
        if(batchID !== batchid){
            throw new ErrorHandler(401, "You are not enrolled in the related course to resolve this report", null);
        }
        await Report.deleteReportofComment(req.params.id);
        return res.status(200).send(new SuccessResponse("OK", 200, "Report has been resolved successfully", null));
    }catch (e) {
        next(e);
    }
}
exports.getReportedComments = async (req,res,next) => {
    try{
        let user = res.locals.middlewareResponse.user;
        let batchid = user.batchID;
        let payload = [];
        let reportedCommentIDs = await Report.getReportedCommentID()
        if(reportedCommentIDs.length===0){
            return res.status(200).send(new SuccessResponse("OK", 200, "There is no reported comment", null));
        }
        let i,m;
        let reportedPostIDs = [];
        let validPostIDs = [];
        let validCommentIDs = [];
        for(m=0;m<reportedCommentIDs.length;m++){

            let postIDofComments = await Comment.getPostID(reportedCommentIDs[m].CommentID);
            let answerIDofComments = await Comment.getAnswerID(reportedCommentIDs[m].CommentID);
            if(postIDofComments.length===0 && answerIDofComments.length===0){
                throw new ErrorHandler(404, "Comment not found", null);
            }
            let relatedPostID;
            if(!postIDofComments[0].PostID){
                let postID = await Answer.getPostID(answerIDofComments[0].AnswerID);
                relatedPostID=postID[0].PostID;
            }
            else{
                relatedPostID=postIDofComments[0].PostID;
            }
            reportedPostIDs.push(relatedPostID);

        }
        for(i=0;i<reportedPostIDs.length;i++){
            let courseName = await Post.getCourseNumberofPost(reportedPostIDs[i]);
            let array = await Coursedetails.getCourseID(courseName[0].courseName);
            let batchID = array[0].BatchID;
            if(batchID === batchid){
                validPostIDs.push(reportedPostIDs[i]);
                validCommentIDs.push(reportedCommentIDs[i].CommentID);
            }
        }
        let j;
        if(validPostIDs.length===0){
            return res.status(200).send(new SuccessResponse("OK", 200, "There is no reported comment ", null));
        }
        for(j=0;j<validPostIDs.length;j++) {
            let commentDetails = await Comment.getCommentDetails(validCommentIDs[j]);
            let postDetails = await Post.getPostDetails(validPostIDs[j]);
            let userDetails = await User.getUserDetailsByUserID(commentDetails.UserID);
            payload.push({
                postId : validPostIDs[j],
                commentId : validCommentIDs[j],
                owner : {
                    name : userDetails.Name,
                    studentId : userDetails.ID,
                    profilePic : userDetails.ProfilePic,
                    karma : userDetails.Karma

                },
                type : postDetails.Type,
                createdAt : commentDetails.Date,
                termFinal : {
                    level : postDetails.level,
                    term : postDetails.term
                },
                description : commentDetails.Description
            });
        }
        return res.status(200).send(new SuccessResponse("OK", 200, "Reported comments fetched successfully", payload));
    }catch (e) {
        next(e);
    }
}
