const Post = require('../models/post');
const PostController = require('./post');

const {ErrorHandler} = require('../response/error');
const {SuccessResponse} = require('../response/success');

const MAX_POST_IN_A_SEARCH = 10;

exports.getSearchResult = async (req, res, next) => {
    try {
        let skip = 0;
        if (req.query.skip)
            skip = req.query.skip;
        let limit = MAX_POST_IN_A_SEARCH;
        if (req.query.limit && limit > req.query.limit)
            limit = req.query.limit;

        let condition = "";
        let condition2 = "";

        if (req.body.courseId) {
            condition += `courseName = '${req.body.courseId}'`;
            condition2 += `name = '${req.body.courseId}'`;
        }
        if (req.body.topic) {
            if (condition.length > 0)
                condition += " or ";
            condition += `topic = '${req.body.topic}'`;

            if (condition2.length > 0)
                condition2 += " or ";
            condition2 += `name = '${req.body.topic}'`;
        }
        if (req.body.book) {
            if (condition.length > 0)
                condition += " or ";
            condition += `book = '${req.body.book}'`;

            if (condition2.length > 0)
                condition2 += " or ";
            condition2 += `name = '${req.body.book}'`;
        }
        if (req.body.level) {
            if (condition.length > 0)
                condition += " or ";
            condition += `level = ${req.body.level}`;
        }
        if (req.body.term) {
            if (condition.length > 0)
                condition += " or ";
            condition += `term = ${req.body.term}`;
        }
        if (req.body.text) {
            if (condition.length > 0)
                condition += " or ";
            condition += `title like '%${req.body.text}%'
                           or  description like '%${req.body.text}%'`;

            if (condition2.length > 0)
                condition2 += " or ";
            condition2 += `name like '%${req.body.text}%'`;
        }

        let payload;
        if (condition.length === 0 && condition2.length === 0)
            payload = [];
        else {
            if (condition.length === 0)
                condition = "0";
            else if (condition2.length === 0)
                condition2 = "0";

            let posts = await Post.searchPost(condition, condition2);
            posts = JSON.parse(JSON.stringify(posts));
            // console.log(posts);
            posts = posts.slice(skip, skip + limit);
            // console.log(posts);

            const userId = res.locals.middlewareResponse.user.id;
            let promises = [];
            for (let post of posts)
                promises.push(PostController.fetchPost(post.id, userId));

            payload = await Promise.all(promises);
            // console.log(payload);
        }

        return res.status(200).send(new SuccessResponse("OK", 200,
            "Search results fetched successfully", payload));

    } catch (e) {
        next(e);
    }
};
