const Post = require('../models/post');
const Comment = require('../models/comment');
const User = require('../models/user');
const Tag = require('../models/tag');
const dateTime = require('node-datetime');

const {validationResult} = require('express-validator');
const {ErrorHandler} = require('../response/error');
const {SuccessResponse} = require('../response/success');
const {deleteImage} = require('../storage/cleanup');

const getUniqueIdentifier = () => {
    const identifier = new Date().getTime().toString() +
        Math.ceil(Math.random() * 10000000000000000000000000).toString() +
        Math.ceil(Math.random() * 10000000000000000000000000).toString() +
        Math.ceil(Math.random() * 10000000000000000000000000).toString() +
        Math.ceil(Math.random() * 10000000000000000000000000).toString() +
        Math.ceil(Math.random() * 10000000000000000000000000).toString() +
        Math.ceil(Math.random() * 10000000000000000000000000).toString() +
        Math.ceil(Math.random() * 10000000000000000000000000).toString();

    return identifier.substring(0, 20);
}

exports.createPost = async (req, res, next) => {
    try {
        // console.log(req.body);
        const errors = validationResult(req);
        if (!errors.isEmpty())
            throw new ErrorHandler(400, errors);

        if (!(req.body.type.toLowerCase() === 'discussion' || req.books.type.toLowerCase() === 'question'))
            throw new ErrorHandler(400, 'Invalid type');

        if (!req.body.termFinal.level || typeof (req.body.termFinal.level) !== typeof (1))
            throw new ErrorHandler(400, 'In term final object there must be a integer field named level');
        if (!req.body.termFinal.term || typeof (req.body.termFinal.term) !== typeof (1))
            throw new ErrorHandler(400, 'In term final object there must be a integer field named term');

        if (req.body.termFinal.level < 1 || req.body.termFinal.level > 5)
            throw new ErrorHandler(400, 'Invalid Level');
        if (req.body.termFinal.term < 1 || req.body.termFinal.term > 2)
            throw new ErrorHandler(400, 'Invalid Term');

        req.body.customTag.forEach(tag => {
            if (typeof (tag) !== typeof (""))
                throw new ErrorHandler(400, 'In custom tag array there must be a string type element');
        });

        req.body.resources.forEach(resource => {
            if (typeof (resource) !== typeof ({}))
                throw new ErrorHandler(400, 'In resources array there must be a object type element');

            if (!resource.link || typeof (resource.link) !== typeof (""))
                throw new ErrorHandler(400, 'A resource must have a string field link.');

            if (!resource.type || typeof (resource.type) !== typeof (""))
                throw new ErrorHandler(400, 'A resource must have a string field type.');
        });

        let exist;

        if (req.body.course) {
            exist = await Tag.isExist(req.body.course, 'course');
            if (!exist)
                throw new ErrorHandler(400, 'Course not found.');
        }

        if (req.body.topic) {
            exist = await Tag.isExist(req.body.topic, 'topic');
            if (!exist)
                throw new ErrorHandler(400, 'Topic not found.');
        }

        if (req.body.book) {
            exist = await Tag.isExist(req.body.book, 'book');
            if (!exist)
                throw new ErrorHandler(400, 'Book not found.');
        }

        let user = res.locals.middlewareResponse.user;

        // const date = dateTime.create().format('Y-m-d H:M:S').toString();
        // console.log(date);

        const identifier = getUniqueIdentifier();
        // console.log(identifier);

        await Post.createPost(user.id, req.body.type,
            req.body.title, req.body.description,
            0, 0,
            req.body.termFinal.level, req.body.termFinal.term,
            req.body.course, req.body.book,
            req.body.topic, identifier);

        const postID = await Post.getPostIDByIdentifier(identifier);
        // console.log(postID);

        await Post.addPostTag(postID, req.body.topic);
        await Post.addPostTag(postID, req.body.book);
        await Post.addPostTag(postID, req.body.course);

        for (const tag of req.body.customTag)
            await Post.addPostTag(postID, tag);

        for (const resource of req.body.resources)
            await Post.addPostResource(postID, resource.link, resource.type);

        return res.status(200).send(new SuccessResponse("OK", 200,
            "Post created successfully", null));

    } catch (e) {
        next(e);
    }
};


exports.getPost = async (req, res, next) => {
    try {
        let user = res.locals.middlewareResponse.user;
        const postId = req.params.postId;

        // console.log(postId);
        const postDetails = await Post.getPostDetails(postId);
        console.log(postDetails);

        if (!postDetails)
            throw new ErrorHandler(400, 'Post not found.');

        if (!(postDetails.type.toLowerCase() === 'discussion' || postDetails.type.toLowerCase() === 'question'))
            throw new ErrorHandler(400, 'Invalid post type');

        let exist;
        if (postDetails.course) {
            exist = await Tag.isExist(postDetails.course, 'course');
            if (!exist)
                throw new ErrorHandler(400, 'Course not found.');
        }

        if (postDetails.book) {
            exist = await Tag.isExist(postDetails.book, 'book');
            if (!exist)
                throw new ErrorHandler(400, 'Book not found.');
        }

        if (postDetails.topic) {
            exist = await Tag.isExist(postDetails.topic, 'topic');
            if (!exist)
                throw new ErrorHandler(400, 'Topic not found.');
        }

        console.log(postDetails.date);
        postDetails.date = dateTime.create(postDetails.date).getTime();
        console.log(postDetails.date);

        const owner = await User.getUserDetailsByUserID(postDetails.userID);
        if (!owner)
            throw new ErrorHandler(400, 'Owner not found.');

        delete postDetails.userID;
        postDetails.owner = owner;

        postDetails.termFinal = {
            level: postDetails.level,
            term: postDetails.term
        };
        delete postDetails.level;
        delete postDetails.term;

        let tags = await Post.getPostTags(postId);
        tags = tags.filter(tag => tag.Name !== postDetails.course &&
            tag.Name !== postDetails.book &&
            tag.Name !== postDetails.topic);
        postDetails.customTag = tags.map(t => t.Name);

        postDetails.files = await Post.getPostFiles(postId);

        postDetails.isReported = (await Post.isReport(postId, user.id)) != null;
        postDetails.isFollowing = (await Post.isFollow(postId, user.id)) != null;

        postDetails.comments = await Comment.getCommentOfAPost(postId);

        for (const comment of postDetails.comments) {
            comment.createdAt = dateTime.create(comment.createdAt).getTime();
            const owner = await User.getUserDetailsByUserID(comment.ownerID);
            if (!owner)
                throw new ErrorHandler(400, 'Comment Owner not found.');
            comment.owner = owner;

            delete comment.ownerID;
        }

        return res.status(200).send(new SuccessResponse("OK", 200,
            "List of course’s fetched successfully", postDetails));

    } catch (e) {
        next(e);
    }
};
