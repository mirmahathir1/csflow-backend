const Post = require('../models/post');
const User = require('../models/user');
const PostController = require('./post');

const {ErrorHandler} = require('../response/error');
const {SuccessResponse} = require('../response/success');

exports.getSearchResult = async (req, res, next) => {
    try {
        const skip = res.locals.middlewareResponse.skip;
        const limit = res.locals.middlewareResponse.limit;

        let condition = "";
        let condition2 = "";



        let request = req.query;
        // let request = req.body;

        request.level = parseInt(request.level+"");
        request.term = parseInt(request.term+"");


        if (request.courseId) {
            condition += `courseName = '${request.courseId}'`;
            condition2 += `name = '${request.courseId}'`;
        }
        if (request.topic) {
            if (condition.length > 0)
                condition += " or ";
            condition += `topic = '${request.topic}'`;

            if (condition2.length > 0)
                condition2 += " or ";
            condition2 += `name = '${request.topic}'`;
        }
        if (request.book) {
            console.log("Executed book query")
            if (condition.length > 0)
                condition += " or ";
            condition += `book = '${request.book}'`;

            if (condition2.length > 0)
                condition2 += " or ";
            condition2 += `name = '${request.book}'`;
        }
        if (request.level) {
            if (condition.length > 0)
                condition += " or ";
            condition += `level = ${request.level}`;
        }
        if (request.term) {
            if (condition.length > 0)
                condition += " or ";
            condition += `term = ${request.term}`;
        }
        if (request.text) {
            if (condition.length > 0)
                condition += " or ";
            condition += `title like '%${request.text}%'
                           or  description like '%${request.text}%'`;

            if (condition2.length > 0)
                condition2 += " or ";
            condition2 += `name like '%${request.text}%'`;
        }

        let payload;
        if (condition.length === 0 && condition2.length === 0)
            payload = [];
        else {
            if (condition.length === 0)
                condition = "0";
            else if (condition2.length === 0)
                condition2 = "0";

            const userId = res.locals.middlewareResponse.user.id;

            let posts = await Post.searchPost(condition, condition2);
            payload = await PostController.fetchPosts(posts, skip, limit, userId);
            // console.log(payload);
        }

        return res.status(200).send(new SuccessResponse("OK", 200,
            "Search results fetched successfully", payload));

    } catch (e) {
        next(e);
    }
};

exports.getTopPost = async (req, res, next) => {
    try {
        const skip = res.locals.middlewareResponse.skip;
        const limit = res.locals.middlewareResponse.limit;

        const userId = res.locals.middlewareResponse.user.id;

        let posts = await Post.topPost();
        const payload = await PostController.fetchPosts(posts, skip, limit, userId);
        return res.status(200).send(new SuccessResponse("OK", 200,
            "Top posts fetched successfully", payload));

    } catch (e) {
        next(e);
    }
};

exports.getRelevantPost = async (req, res, next) => {
    try {
        const skip = res.locals.middlewareResponse.skip;
        const limit = res.locals.middlewareResponse.limit;

        const user = res.locals.middlewareResponse.user;

        let posts = await Post.relevantPost(user.level, user.term);
        const payload = await PostController.fetchPosts(posts, skip, limit, user.id);
        return res.status(200).send(new SuccessResponse("OK", 200,
            "Relevant posts fetched successfully", payload));

    } catch (e) {
        next(e);
    }
};

exports.getUnansweredPost = async (req, res, next) => {
    try {
        const skip = res.locals.middlewareResponse.skip;
        const limit = res.locals.middlewareResponse.limit;

        const user = res.locals.middlewareResponse.user;

        let posts = await Post.unansweredPost();
        const payload = await PostController.fetchPosts(posts, skip, limit, user.id);
        return res.status(200).send(new SuccessResponse("OK", 200,
            "Unanswered posts fetched successfully", payload));

    } catch (e) {
        next(e);
    }
};

exports.getTopUser = async (req, res, next) => {
    try {
        const skip = res.locals.middlewareResponse.skip;
        const limit = res.locals.middlewareResponse.limit;

        let users = await User.getTopUser();

        users = JSON.parse(JSON.stringify(users));
        users = users.slice(skip, skip + limit);

        let payload = [];
        for (let u of users){
            let user = await User.findById(u.id);
            if (!user)
                throw new ErrorHandler(404, "User not found");

            const statistics = await user.getUserStatistics();
            user = {
                ...user,
                ...statistics,
            };
            payload.push(user);
        }

        return res.status(200).send(new SuccessResponse("OK", 200,
            "List of sorted user's fetched successfully", payload));

    } catch (e) {
        next(e);
    }
};
