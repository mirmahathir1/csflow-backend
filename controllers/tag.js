const Tag = require('../models/tag');

const {validationResult} = require('express-validator');
const {ErrorHandler} = require('../response/error');
const {SuccessResponse} = require('../response/success');


exports.controlTagRequest = async (req, res, next) => {
    try {
        // console.log(req.body);
        const errors = validationResult(req);
        if (!errors.isEmpty())
            throw new ErrorHandler(400, errors);

        const name = req.body.name;
        const type = req.body.type;
        const course = req.body.course;

        if (!(type.toLowerCase() === "book" || type.toLowerCase()() === "topic"))
            return res.status(404).send(new ErrorHandler(404, "Invalid tag type"))

        const courseTag = await Tag.findCourseIDByName(course);

        if (!courseTag || courseTag.id.toString().length === 0)
            return res.status(404).send(new ErrorHandler(404, "Course not found"))

        // console.log(courseTag);
        let user = res.locals.middlewareResponse.user;
        if (!user)
            throw new ErrorHandler(404, "User not found");

        await Tag.addRequestedTag(user.id, courseTag.id, type.toLowerCase(), name);

        return res.status(200).send(new SuccessResponse("OK", 200, "New tag request successful", null));
    } catch (e) {
        next(e);
    }
};

exports.getCourses = async (req, res, next) => {
    try {
        let user = res.locals.middlewareResponse.user;
        if (!user)
            throw new ErrorHandler(404, "User not found");

        const result = await Tag.getAllCourseTag();
        // console.log(result);

        let courses = [];

        result.forEach(res => {
            courses.push(res.Name);
        })

        return res.status(200).send(new SuccessResponse("OK", 200,
            "List of course’s fetched successfully", courses));
    } catch (e) {
        next(e);
    }
};

exports.getBooks = async (req, res, next) => {
    try {
        let user = res.locals.middlewareResponse.user;
        if (!user)
            throw new ErrorHandler(404, "User not found");

        const courseTag = await Tag.findCourseIDByName(req.params.course);

        if (!courseTag || courseTag.id.toString().length === 0)
            return res.status(404).send(new ErrorHandler(404, "Course not found"));

        const result = await Tag.getBooksByCourse(courseTag.id);
        // console.log(result);

        let books = [];

        result.forEach(res => {
            books.push(res.Name);
        })

        return res.status(200).send(new SuccessResponse("OK", 200,
            "List of books fetched successfully", books));
    } catch (e) {
        next(e);
    }
};

exports.getTopics = async (req, res, next) => {
    try {
        let user = res.locals.middlewareResponse.user;
        if (!user)
            throw new ErrorHandler(404, "User not found");

        const courseTag = await Tag.findCourseIDByName(req.params.course);

        if (!courseTag || courseTag.id.toString().length === 0)
            return res.status(404).send(new ErrorHandler(404, "Course not found"));

        const result = await Tag.getTopicsByCourse(courseTag.id);
        // console.log(result);

        let topics = [];

        result.forEach(res => {
            topics.push(res.Name);
        })

        return res.status(200).send(new SuccessResponse("OK", 200,
            "List of topics fetched successfully", topics));
    } catch (e) {
        next(e);
    }
};

exports.deleteProfile = async (req, res, next) => {
    try {
        let user = res.locals.middlewareResponse.user;
        await user.deleteMe();
        return res.status(200).send(new SuccessResponse("OK", 200,
            "Account deletion successful", null));
    } catch (e) {
        next(e);
    }
};

exports.updateName = async (req, res, next) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty())
            throw new ErrorHandler(400, errors);

        let user = res.locals.middlewareResponse.user;
        await user.updateName(req.body.name);

        return res.status(200).send(new SuccessResponse("OK", 200,
            "Edit successful", null));
    } catch (e) {
        next(e);
    }
};

exports.uploadProfilePic = async (req, res, next) => {
    try {
        if (!req.file)
            return res.status(400).send(new ErrorHandler(400, "No file received"));

        const imageLink = await uploadAnImage(req.file, "profile-pic");

        let user = res.locals.middlewareResponse.user;
        // console.log();
        if (!user) {
            return res.status(401).send(new ErrorHandler(401, "Invalid user"));
        }
        await user.saveProfilePicLink(imageLink);

        await deleteImage(user.profilePic);
        //console.log("send")
        return res.status(200).send(new SuccessResponse("OK", 200,
            `Uploaded mage successfully. New Image link ${imageLink}`, null));
    } catch (e) {
        next(e);
    }
};

