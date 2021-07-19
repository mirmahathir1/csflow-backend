const Resourcearchive = require('../models/resourcearchive');
const Thesisarchive = require('../models/thesisarchive');
const ThesisOwner = require('../models/thesisowner');
const Projectarchive = require('../models/projectarchive');
const Projectowner = require('../models/projectowner');
const Coursedetails = require('../models/coursedetails');
const Batch = require('../models/batch');
const User = require('../models/user');
const ThesisTag = require('../models/thesistag');
const ThesisRequest = require('../models/thesisRequest');
const ProjectRequest = require('../models/projectRequest');
const Notification = require('../models/notification');
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

            /*if (rawResources.length === 0) {
                //throw new ErrorHandler(404, "Archive not found", null);
                //return res.status(200).send(new SuccessResponse("OK", 200, "Fetched drive links successfully", null));
            }*/

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
        let batches = await Batch.getBatches();
        let flag=false;
        batches.forEach((batch)=>{
            if(batch.ID===parseInt(req.params.batchNumber)){
                flag=true;
            }
        })

        if(!flag){
            throw new ErrorHandler(404,"Batch not found",null);
        }
        let thesisTitles = await Thesisarchive.getThesisTitleByBatchID(req.params.batchNumber);

        if (thesisTitles.length === 0) {
            return res.status(200).send(new SuccessResponse("OK", 200, "Thesis not found", []));
        }

        return res.status(200).send(new SuccessResponse("OK", 200, "List of theses fetched successfully", thesisTitles));
    } catch (e) {
        next(e);
    }
};

exports.getThesisDetailsByThesisID = async (req, res, next) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            throw new ErrorHandler(400, errors.errors[0].msg, errors);
        }
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
        let newArray = firstThesis.TagName.split(",");
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
        let requestedUsers = await ThesisRequest.getRequestedUsers(req.params.id);
        let Details = {
            batch: firstThesis.BatchID,
            title: firstThesis.Title,
            link: firstThesis.Link,
            tags: newArray,
            writers: array,
            description: firstThesis.Abstract,
            owners: owners,
            requested_owners: requestedUsers,
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
        let userid = user.id;

        let title = req.body.title;
        let Writers = req.body.writers;
        let Topics = req.body.tags;


        let writers = Writers.join(",");
        let topics = Topics.join(",");
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
        for (j = 0; j < Topics.length; j++) {

            if (typeof Topics[j] != "string") {
                throw new ErrorHandler(400, "Missing/ miswritten fields in request", null);
            }
        }

        for (i = 0; i < owners.length; i++) {
            // let row2 = await User.isUser(owners[i]);
            if (!await User.isUser(owners[i])) {
                throw new ErrorHandler(404, "Student ID not found", null);
            }
        }
        let m,n;
        for(m=0;m<owners.length;m++){
            for(n=m+1;n<owners.length;n++){
                if(owners[m]===owners[n]){
                    throw new ErrorHandler(400,"Duplicate owners found",null);
                }
            }
        }
        let regEx = new RegExp("https?:\\/\\/(www\\.)?[-a-zA-Z0-9@:%._\\+~#=]{1,256}\\.[a-zA-Z0-9()]{1,6}\\b([-a-zA-Z0-9()@:%_\\+.~#?&//=]*)");
        //let regEx = new RegExp("((http|https)(:\\/\\/))?([a-zA-Z0-9]+[.]{1}){2}[a-zA-z0-9]+(\\/{1}[a-zA-Z0-9]+)*\\/?", "i");
        if(!link.match(regEx)){
            //console.log("not OK");
            throw new ErrorHandler(400, "Missing/ miswritten fields in request", null);

        }

        let row = await Thesisarchive.getMaxID();

        let count = Object.values(row);
        let id = count[0] + 1;

        //batchID,title,authors,abstract,link,owners
        await Thesisarchive.create(id, batchid, title, writers, description, link,topics);
        let k;
        await ThesisOwner.create(id,userid);
        //notification
        for (k = 0; k < owners.length; k++) {
            //await ThesisOwner.create(id, owners[k]);
            if(userid!==owners[k]){
                await ThesisRequest.addRequest(id,userid,owners[k]);
                await Notification.addNotification(owners[k],`${userid} wants to add you as an owner of the thesis`,`/archive/thesis/${id}`);
            }
        }

        return res.status(201).send(new SuccessResponse("OK", 201, "Thesis created Successfully", null));
    } catch (e) {
        next(e);
    }
};
exports.deleteThesis = async (req, res, next) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            throw new ErrorHandler(400, errors.errors[0].msg, errors);
        }
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
        await ThesisRequest.deleteThesisID(req.params.id);

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
        let Topics = req.body.tags;

        let writers = Writers.join(",");
        let topics = Topics.join(",");
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
        for (j = 0; j < Topics.length; j++) {

            if (typeof Topics[j] != "string") {
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

        let m,n;
        for(m=0;m<owners.length;m++){
            for(n=m+1;n<owners.length;n++){
                if(owners[m]===owners[n]){
                    throw new ErrorHandler(400,"Duplicate owners found",null);
                }
            }
        }

        let regEx = new RegExp("https?:\\/\\/(www\\.)?[-a-zA-Z0-9@:%._\\+~#=]{1,256}\\.[a-zA-Z0-9()]{1,6}\\b([-a-zA-Z0-9()@:%_\\+.~#?&//=]*)");

        if(!link.match(regEx)){
            //console.log("not OK");
            throw new ErrorHandler(400, "Missing/ miswritten fields in request", null);

        }

        await Thesisarchive.update(req.params.id, batchid, title, writers, description, link,topics);
        //await ThesisOwner.DeleteThesisOwner(req.params.id);
        let q;
        //notification
        let newOwners=owners;

        let oldOwners = await ThesisOwner.getOwners(req.params.id);
        let delOwners=oldOwners;
        let w,r;
        for(w=0;w<owners.length;w++){
            for(r=0;r<oldOwners.length;r++){
                if(owners[w]===oldOwners[r].UserID){
                    newOwners = newOwners.filter(function(ele){
                        return ele !== owners[w];});
                   delOwners = delOwners.filter((item) => item.UserID !== owners[w]);

                    continue;
                }
            }
        }
        let h;

        for(h=0;h<delOwners.length;h++){
            await ThesisOwner.DeleteThesisOwners(req.params.id,delOwners[h].UserID);


        }

        let temp=newOwners;
        let x,y;
        let requestedUsers = await ThesisRequest.getRequestedUsers(req.params.id);
        let temp2 = requestedUsers;
        if(requestedUsers.length!==0){
            for(x=0;x<temp.length;x++){
                for(y=0;y<requestedUsers.length;y++){
                    if(temp[x]===requestedUsers[y].UserID){
                        newOwners = newOwners.filter(function(ele){
                            return ele !== temp[x];});
                        temp2 = temp2.filter((item) => item.UserID !== temp[x]);
                        continue;
                    }
                }
            }
        }
        let b;
        for(b=0;b<temp2.length;b++){
            await ThesisRequest.deleteRequest(req.params.id,temp2[b].UserID);
        }
        for(q=0;q<newOwners.length;q++){
            //await ThesisOwner.create(req.params.id,owners[q]);
            await ThesisRequest.addRequest(req.params.id,userid,newOwners[q]);
            await Notification.addNotification(newOwners[q],`${userid} wants to add you as an owner of the thesis`,`/archive/thesis/${req.params.id}`);
        }

        return res.status(200).send(new SuccessResponse("OK", 200, "Thesis edited Successfully", null));
    } catch (e) {
        next(e);
    }
};
exports.getRequestedThesis = async (req,res,next)=>{
    try{
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            throw new ErrorHandler(400, "Missing/ miswritten fields in request", null);
        }
        let user = res.locals.middlewareResponse.user;

        let userid = user.id;
        let thesisid = req.params.id;
        let thesis = await Thesisarchive.findThesis(req.params.id);
        if (!thesis) {
            throw new ErrorHandler(404, "Thesis not found", null);
        }
        let requestedThesis = await ThesisRequest.getRequestedThesis();
        let t;
        let flag2=false;
        for(t=0;t<requestedThesis.length;t++){
            if(requestedThesis[t].ThesisID==thesisid){
                flag2=true;
                break;
            }
        }
        if(flag2===false){
            throw new ErrorHandler(401, "Thesis not expecting approval/ rejection", null);
        }
        let requestedUsers = await ThesisRequest.getRequestedUsers(thesisid);
        if(requestedUsers.length===0){
            throw new ErrorHandler(404, "There is no requested owner of this thesis", null);
        }
        return res.status(200).send(new SuccessResponse("OK", 200, "Requested owners of this thesis are fetched successfully", requestedUsers));

    }catch (e) {
        next(e);
    }
};
exports.acceptThesis = async (req,res,next)=>{
    try{
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            throw new ErrorHandler(400, "Missing/ miswritten fields in request", null);
        }
        let user = res.locals.middlewareResponse.user;

        let userid = user.id;
        let thesisid = req.params.id;
        let thesis = await Thesisarchive.findThesis(req.params.id);
        if (!thesis) {
            throw new ErrorHandler(404, "Thesis not found", null);
        }
        let requestedThesis = await ThesisRequest.getRequestedThesis();
        let t;
        let flag2=false;
        for(t=0;t<requestedThesis.length;t++){
            if(requestedThesis[t].ThesisID==thesisid){
                flag2=true;
                break;
            }
        }
        if(flag2===false){
            throw new ErrorHandler(401, "Thesis not expecting approval/ rejection", null);
        }
        let requestedUsers = await ThesisRequest.getRequestedUsers(thesisid);
        let q;
        let flag=false;
        for(q=0;q<requestedUsers.length;q++){
            if(requestedUsers[q].UserID==userid){
                flag=true;
                break;
            }
        }
        if(flag===false){
            throw new ErrorHandler(401, "You are unauthorized to accept/reject this thesis", null);
        }
        await ThesisOwner.create(thesisid,userid);
        await ThesisRequest.deleteRequest(thesisid,userid);
        return res.status(200).send(new SuccessResponse("OK", 200, "Thesis authorship accepted successfully", null));

    }catch (e) {
        next(e);
    }
};
exports.rejectThesis = async (req,res,next)=>{
    try{
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            throw new ErrorHandler(400, "Missing/ miswritten fields in request", null);
        }
        let user = res.locals.middlewareResponse.user;

        let userid = user.id;
        let thesisid = req.params.id;
        let thesis = await Thesisarchive.findThesis(req.params.id);
        if (!thesis) {
            throw new ErrorHandler(404, "Thesis not found", null);
        }
        let requestedThesis = await ThesisRequest.getRequestedThesis();

        let t;
        let flag2=false;
        for(t=0;t<requestedThesis.length;t++){
            if(requestedThesis[t].ThesisID==req.params.id){
                flag2=true;
                break;
            }
        }

        if(flag2===false){
            throw new ErrorHandler(401, "Thesis not expecting approval/ rejection", null);
        }
        let requestedUsers = await ThesisRequest.getRequestedUsers(thesisid);
        let q;
        let flag=false;
        for(q=0;q<requestedUsers.length;q++){
            if(requestedUsers[q].UserID==userid){
                flag=true;
                break;
            }
        }
        if(flag===false){
            throw new ErrorHandler(401, "You are unauthorized to accept/reject this thesis", null);
        }

        await ThesisRequest.deleteRequest(thesisid,userid);
        return res.status(200).send(new SuccessResponse("OK", 200, "Rejection successful", null));

    }catch (e) {
        next(e);
    }
};
exports.getThesisTopics = async(req,res,next)=>{
    try{
        let topics = await ThesisTag.getTopics();
        if(topics.length===0){
            throw new ErrorHandler(404, "There is no thesis topic", null);
        }
        let payload = [],i;
        for(i=0;i<topics.length;i++){
            payload.push(topics[i].TagName);
        }
        return res.status(200).send(new SuccessResponse("OK", 200, "List of thesis topics fetched successfully", payload));

    }catch (e) {
        next(e);
    }
}
exports.searchThesis = async (req,res,next)=>{
    try{

        let theses = await Thesisarchive.findTheses(req.query.text);
        if(theses.length===0){
            throw new ErrorHandler(404, "thesis related this text not found", null);

        }
        return res.status(200).send(new SuccessResponse("OK", 200, "List of theses fetched successfully", theses));

    }catch (e) {
        next(e);
    }
}
exports.findCoursesOfProject = async(req,res,next)=>{
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            throw new ErrorHandler(400, errors.errors[0].msg, errors);
        }

        let batches = await Batch.getBatches();
        let flag=false;
        batches.forEach((batch)=>{
            if(batch.ID===parseInt(req.params.batchNumber)){
                flag=true;
            }
        })

        if(!flag){
            throw new ErrorHandler(404,"Batch not found",null);
        }
        let courseListOfProject = await Coursedetails.findCourses(req.params.batchNumber);
        if(courseListOfProject.length===0){
            //throw new ErrorHandler(404,"Batch not found",null);
            return res.status(200).send(new SuccessResponse("OK", 200, "Courses with projects not found",[]));
        }
        return res.status(200).send(new SuccessResponse("OK", 200, "Courses with projects fetched successfully", courseListOfProject));
    }catch (e) {
        next(e);
    }
};
exports.findProjectList = async(req,res,next)=>{
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            throw new ErrorHandler(400, errors.errors[0].msg, errors);
        }
        let batches = await Batch.getBatches();
        let flag=false;
        batches.forEach((batch)=>{
            if(batch.ID===parseInt(req.params.batchNumber)){
                flag=true;
            }
        })

        if(!flag){
            throw new ErrorHandler(404,"Batch not found",null);
        }
        let courseArray = req.params.courseNum.split("-");
        let courseNumber = courseArray.join(" ");
        let courseID = await Coursedetails.getCourseID(courseNumber);
        if(courseID.length===0){
            throw new ErrorHandler(404,"Course not found",null);
        }
        let projectList = await Projectarchive.findProjectList(req.params.batchNumber,courseID[0].ID);
        if(projectList.length===0){
            return res.status(200).send(new SuccessResponse("OK", 200, "Project not found", []));
        }
        return res.status(200).send(new SuccessResponse("OK", 200, "List of project fetched successfully", projectList));
    }catch (e) {
        next(e);
    }
};
exports.getCoursesofProjects = async (req,res,next) => {
    try{
        let courseListOfProject = await Coursedetails.findCoursesofProjects();
        if(courseListOfProject.length===0){
            //throw new ErrorHandler(404,"Batch not found",null);
            return res.status(200).send(new SuccessResponse("OK", 200, "Courses with projects not found",[]));
        }
        return res.status(200).send(new SuccessResponse("OK", 200, "Courses with projects fetched successfully", courseListOfProject));
    }catch (e) {
        next(e);
    }

}
exports.searchProjects = async (req,res,next)=>{
    try{

        let projects = await Projectarchive.findProjects(req.query.text);
        if(projects.length===0){
            throw new ErrorHandler(404, "project related this text not found", null);

        }
        return res.status(200).send(new SuccessResponse("OK", 200, "List of project fetched successfully", projects));

    }catch (e) {
        next(e);
    }
}
exports.postProject = async (req, res, next) => {
    try {

        let user = res.locals.middlewareResponse.user;

        let batchid = user.batchID;
        let userid = user.id;
        let title = req.body.title;
        let codeLink = req.body.github;
        let videoLink = req.body.youtube;
        let Topics = req.body.tags;
        let topics = Topics.join(",");
        let description = req.body.description;
        let courseNo = req.body.course;
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
        for (i = 0; i < Topics.length; i++) {

            if (typeof Topics[i] != "string") {
                throw new ErrorHandler(400, "Missing/ miswritten fields in request", null);
            }
        }

        let m,n;
        for(m=0;m<owners.length;m++){
            for(n=m+1;n<owners.length;n++){
                if(owners[m]===owners[n]){
                    throw new ErrorHandler(400,"Duplicate owners found",null);
                }
            }
        }
        let courseID = await Coursedetails.getCourseID(courseNo);
        if(courseID.length===0){
            throw new ErrorHandler(404,"Course not found",null);
        }
        for (i = 0; i < owners.length; i++) {
            // let row2 = await User.isUser(owners[i]);
            if (!await User.isUser(owners[i])) {
                throw new ErrorHandler(404, "Student ID not found", null);
            }
        }

        let regEx = new RegExp("https?:\\/\\/(www\\.)?[-a-zA-Z0-9@:%._\\+~#=]{1,256}\\.[a-zA-Z0-9()]{1,6}\\b([-a-zA-Z0-9()@:%_\\+.~#?&//=]*)");

        if(!(codeLink.match(regEx)) || !(videoLink.match(regEx))){
            //console.log("not OK");
            throw new ErrorHandler(400, "Missing/ miswritten fields in request", null);

        }

        let row = await Projectarchive.getMaxID();

        let count = Object.values(row);
        let id = count[0] + 1;


        await Projectarchive.create(id,courseID[0].ID,batchid,title,description,videoLink,codeLink,topics);
        let k;

        await Projectowner.create(id,userid);
        //notification
        for (k = 0; k < owners.length; k++) {
            //await ThesisOwner.create(id, owners[k]);
            if(userid!==owners[k]){
                await ProjectRequest.addRequest(id,userid,owners[k]);
                await Notification.addNotification(owners[k],`${userid} wants to add you as an owner of the project`,`/archive/project/${id}`);
            }
        }

        return res.status(201).send(new SuccessResponse("OK", 201, "Project created Successfully", null));
    } catch (e) {
        next(e);
    }
};

exports.editProject = async (req, res, next) => {
    try {

        let user = res.locals.middlewareResponse.user;

        let batchid = user.batchID;
        let userid = user.id;
        let title = req.body.title;
        let codeLink = req.body.github;
        let videoLink = req.body.youtube;
        let Topics = req.body.tags;
        let topics = Topics.join(",");
        let description = req.body.description;
        let courseNo = req.body.course;
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
        for (i = 0; i < Topics.length; i++) {

            if (typeof Topics[i] != "string") {
                throw new ErrorHandler(400, "Missing/ miswritten fields in request", null);
            }
        }
        let project = await Projectarchive.findProject(req.params.id);
        if (project.length===0) {
            throw new ErrorHandler(404, "Project not found", null);
        }

        let auth = await Projectarchive.userAuthorization(req.params.id, userid);
        if (!auth) {
            throw new ErrorHandler(401, "User is unauthorized to edit this project", null);
        }
        let courseID = await Coursedetails.getCourseID(courseNo);
        if(courseID.length===0){
            throw new ErrorHandler(404,"Course not found",null);
        }
        for (i = 0; i < owners.length; i++) {
            // let row2 = await User.isUser(owners[i]);
            if (!await User.isUser(owners[i])) {
                throw new ErrorHandler(404, "Student ID not found", null);
            }
        }

        let m,n;
        for(m=0;m<owners.length;m++){
            for(n=m+1;n<owners.length;n++){
                if(owners[m]===owners[n]){
                    throw new ErrorHandler(400,"Duplicate owners found",null);
                }
            }
        }

        let regEx = new RegExp("https?:\\/\\/(www\\.)?[-a-zA-Z0-9@:%._\\+~#=]{1,256}\\.[a-zA-Z0-9()]{1,6}\\b([-a-zA-Z0-9()@:%_\\+.~#?&//=]*)");

        if(!(codeLink.match(regEx)) || !(videoLink.match(regEx))){
            //console.log("not OK");
            throw new ErrorHandler(400, "Missing/ miswritten fields in request", null);

        }

        await Projectarchive.update(req.params.id,courseID[0].ID,batchid,title,description,videoLink,codeLink,topics);

        //await Projectowner.DeleteProjectOwner(req.params.id);
        let q;
        //notification
        let newOwners=owners;

        let oldOwners = await Projectowner.getOwners(req.params.id);
        let delOwners=oldOwners;
        let w,r;
        for(w=0;w<owners.length;w++){
            for(r=0;r<oldOwners.length;r++){
                if(owners[w]===oldOwners[r].UserID){
                    newOwners = newOwners.filter(function(ele){
                        return ele !== owners[w];});
                    delOwners = delOwners.filter((item) => item.UserID !== owners[w]);

                    continue;
                }
            }
        }
        let h;

        for(h=0;h<delOwners.length;h++){
            await Projectowner.DeleteProjectOwners(req.params.id,delOwners[h].UserID);
        }

        let temp=newOwners;
        let x,y;
        let requestedUsers = await ProjectRequest.getRequestedUsers(req.params.id);
        let temp2 = requestedUsers;
        if(requestedUsers.length!==0){
            for(x=0;x<temp.length;x++){
                for(y=0;y<requestedUsers.length;y++){
                    if(temp[x]===requestedUsers[y].UserID){
                        newOwners = newOwners.filter(function(ele){
                            return ele !== temp[x];});
                        temp2 = temp2.filter((item) => item.UserID !== temp[x]);
                        continue;
                    }
                }
            }
        }
        let b;
        for(b=0;b<temp2.length;b++){
            await ProjectRequest.deleteRequest(req.params.id,temp2[b].UserID);
        }
        for(q=0;q<newOwners.length;q++){
            //await ThesisOwner.create(req.params.id,owners[q]);
            await ProjectRequest.addRequest(req.params.id,userid,newOwners[q]);
            await Notification.addNotification(newOwners[q],`${userid} wants to add you as an owner of the project`,`/archive/project/${req.params.id}`);
        }

        return res.status(201).send(new SuccessResponse("OK", 201, "Project edited Successfully", null));
    } catch (e) {
        next(e);
    }
};
exports.deleteProject = async (req, res, next) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            throw new ErrorHandler(400, errors.errors[0].msg, errors);
        }
        let user = res.locals.middlewareResponse.user;

        let userid = user.id;
        let project = await Projectarchive.findProject(req.params.id);
        if (project.length===0) {
            throw new ErrorHandler(404, "Project not found", null);
        }
        let auth = await Projectarchive.userAuthorization(req.params.id, userid);

        if (!auth) {
            throw new ErrorHandler(401, "User is unauthorized to delete this project", null);
        }

        await Projectarchive.DeleteProject(req.params.id);
        await ProjectRequest.deleteProjectID(req.params.id);

        return res.status(200).send(new SuccessResponse("OK", 200, "Project deleted successfully", null));
    } catch (e) {
        next(e);
    }
};
exports.getProjectDetailsByProjectID = async (req, res, next) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            throw new ErrorHandler(400, errors.errors[0].msg, errors);
        }
        let projects = await Projectarchive.findDetailsByProjectID(req.params.id);

        if (projects.length === 0) {
            throw new ErrorHandler(404, "Project not found", null);
        }


        let i;
        let owners = [];
        for (i = 0; i < projects.length; i++) {

            let userid = projects[i].UserID;
            let user = await User.getUserDetailsByUserID(userid);
            owners.push(user);
        }

        let rawComments = await Projectarchive.findCommentsByProjectID(req.params.id);
        let firstProject = projects[0];

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
        let CourseTitle = await Coursedetails.findCourseTitle(firstProject.CourseID);
        let newArray = firstProject.TagName.split(",");
        let requestedUsers = await ProjectRequest.getRequestedUsers(req.params.id);
        let Details = {
            batch: firstProject.BatchID,
            course_no: CourseTitle[0].CourseNo,
            course_title:CourseTitle[0].Title,
            tags: newArray,
            title: firstProject.Title,
            description: firstProject.Description,
            github: firstProject.CodeLink,
            youtube:firstProject.VideoLink,
            owners: owners,
            requested_owners: requestedUsers,
            comments: comments
        };

        return res.status(200).send(new SuccessResponse("OK", 200, "Fetched project details successfully", Details));
    } catch (e) {
        next(e);
    }
};
exports.getRequestedProject = async (req,res,next)=>{
    try{
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            throw new ErrorHandler(400, "Missing/ miswritten fields in request", null);
        }
        let user = res.locals.middlewareResponse.user;

        let userid = user.id;
        let projectid = req.params.id;
        let project = await Projectarchive.findProject(projectid);
        if (!project) {
            throw new ErrorHandler(404, "Project not found", null);
        }
        let requestedProject = await ProjectRequest.getRequestedProject();
        let t;
        let flag2=false;
        for(t=0;t<requestedProject.length;t++){
            if(requestedProject[t].ProjectID==projectid){
                flag2=true;
                break;
            }
        }
        if(flag2===false){
            throw new ErrorHandler(401, "Project not expecting approval/ rejection", null);
        }
        let requestedUsers = await ProjectRequest.getRequestedUsers(projectid);
        if(requestedUsers.length===0){
            throw new ErrorHandler(404, "There is no requested owner of this project", null);
        }
        return res.status(200).send(new SuccessResponse("OK", 200, "Requested owners of this project are fetched successfully", requestedUsers));

    }catch (e) {
        next(e);
    }
};
exports.acceptProject = async (req,res,next)=>{
    try{
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            throw new ErrorHandler(400, "Missing/ miswritten fields in request", null);
        }
        let user = res.locals.middlewareResponse.user;

        let userid = user.id;
        let projectid = req.params.id;
        let project = await Projectarchive.findProject(projectid);
        if (!project) {
            throw new ErrorHandler(404, "Project not found", null);
        }
        let requestedProject = await ProjectRequest.getRequestedProject();
        let t;
        let flag2=false;
        for(t=0;t<requestedProject.length;t++){
            if(requestedProject[t].ProjectID==projectid){
                flag2=true;
                break;
            }
        }
        if(flag2===false){
            throw new ErrorHandler(401, "Project not expecting approval/ rejection", null);
        }
        let requestedUsers = await ProjectRequest.getRequestedUsers(projectid);
        let q;
        let flag=false;
        for(q=0;q<requestedUsers.length;q++){
            if(requestedUsers[q].UserID==userid){
                flag=true;
                break;
            }
        }
        if(flag===false){
            throw new ErrorHandler(401, "You are unauthorized to accept/reject this project", null);
        }
        await Projectowner.create(projectid,userid);
        await ProjectRequest.deleteRequest(projectid,userid);
        return res.status(200).send(new SuccessResponse("OK", 200, "Project authorship accepted successfully", null));

    }catch (e) {
        next(e);
    }
};
exports.rejectProject = async (req,res,next)=>{
    try{
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            throw new ErrorHandler(400, "Missing/ miswritten fields in request", null);
        }
        let user = res.locals.middlewareResponse.user;

        let userid = user.id;
        let projectid = req.params.id;
        let project = await Projectarchive.findProject(projectid);
        if (!project) {
            throw new ErrorHandler(404, "Project not found", null);
        }
        let requestedProject = await ProjectRequest.getRequestedProject();

        let t;
        let flag2=false;
        for(t=0;t<requestedProject.length;t++){
            if(requestedProject[t].ProjectID==req.params.id){
                flag2=true;
                break;
            }
        }

        if(flag2===false){
            throw new ErrorHandler(401, "Project not expecting approval/ rejection", null);
        }
        let requestedUsers = await ProjectRequest.getRequestedUsers(projectid);
        let q;
        let flag=false;
        for(q=0;q<requestedUsers.length;q++){
            if(requestedUsers[q].UserID==userid){
                flag=true;
                break;
            }
        }
        if(flag===false){
            throw new ErrorHandler(401, "You are unauthorized to accept/reject this project", null);
        }

        await ProjectRequest.deleteRequest(projectid,userid);
        return res.status(200).send(new SuccessResponse("OK", 200, "Rejection successful", null));

    }catch (e) {
        next(e);
    }
};
exports.deleteRequestedUserofProject = async (req,res,next)=>{
    try{
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            throw new ErrorHandler(400, "Missing/ miswritten fields in request", null);
        }
        let user = res.locals.middlewareResponse.user;

        let userid = user.id;
        let projectid = req.params.id;
        let requsteduserid = req.params.userid;
        let project = await Projectarchive.findProject(projectid);
        if (!project) {
            throw new ErrorHandler(404, "Project not found", null);
        }
        let requestedProject = await ProjectRequest.getRequestedProject();

        let t;
        let flag2=false;
        for(t=0;t<requestedProject.length;t++){
            if(requestedProject[t].ProjectID==req.params.id){
                flag2=true;
                break;
            }
        }

        if(flag2===false){
            throw new ErrorHandler(401, "Project not expecting approval/ rejection", null);
        }
        let owners = await Projectowner.getOwners(projectid);
        let q;
        let flag=false;
        for(q=0;q<owners.length;q++){
            if(owners[q].UserID==userid){
                flag=true;
                break;
            }
        }
        if(flag===false){
            throw new ErrorHandler(401, "You are unauthorized to delete requested owner", null);
        }

        await ProjectRequest.deleteRequest(projectid,requsteduserid);
        return res.status(200).send(new SuccessResponse("OK", 200, "Deletion is successful", null));

    }catch (e) {
        next(e);
    }
};
exports.deleteRequestedUserofThesis = async (req,res,next)=>{
    try{
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            throw new ErrorHandler(400, "Missing/ miswritten fields in request", null);
        }
        let user = res.locals.middlewareResponse.user;

        let userid = user.id;
        let thesisid = req.params.id;
        let requsteduserid = req.params.userid;
        let thesis = await Thesisarchive.findThesis(thesisid);
        if (!thesis) {
            throw new ErrorHandler(404, "Thesis not found", null);
        }
        let requestedThesis = await ThesisRequest.getRequestedThesis();

        let t;
        let flag2=false;
        for(t=0;t<requestedThesis.length;t++){
            if(requestedThesis[t].ThesisID==req.params.id){
                flag2=true;
                break;
            }
        }

        if(flag2===false){
            throw new ErrorHandler(401, "Thesis not expecting approval/ rejection", null);
        }
        let owners = await ThesisOwner.getOwners(thesisid);
        let q;
        let flag=false;
        for(q=0;q<owners.length;q++){
            if(owners[q].UserID==userid){
                flag=true;
                break;
            }
        }
        if(flag===false){
            throw new ErrorHandler(401, "You are unauthorized to delete requested owner", null);
        }

        await ThesisRequest.deleteRequest(thesisid,requsteduserid);
        return res.status(200).send(new SuccessResponse("OK", 200, "Deletion is successful", null));

    }catch (e) {
        next(e);
    }
};

