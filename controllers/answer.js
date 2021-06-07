const Post = require('../models/post');
const Answer = require('../models/answer');
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
};

const checkAnswerResources = async (answer) => {
    answer.files.forEach(resource => {
        if (typeof (resource) !== typeof ({}))
            throw new ErrorHandler(400, 'In resources array there must be a object type element');

        if (!resource.link || typeof (resource.link) !== typeof (""))
            throw new ErrorHandler(400, 'A resource must have a string field link.');

        if (!resource.type || typeof (resource.type) !== typeof (""))
            throw new ErrorHandler(400, 'A resource must have a string field type.');
    });
};


//////////////////////////////////////////////////////////////////////////////////

const checkPostOwner = async (postId, ownerId) => {
    const postExist = await Post.isPostExist(postId);
    if (!postExist)
        throw new ErrorHandler(400, 'Post not found.');

    const isOwner = await Post.isPostOwner(postId, ownerId);
    if (!isOwner)
        throw new ErrorHandler(400, 'You don’t own this post');
}

const checkPostFields = async (post) => {
    if (!(post.type.toLowerCase() === 'discussion' || post.type.toLowerCase() === 'question'))
        throw new ErrorHandler(400, 'Invalid type');

    if (!post.termFinal.level || typeof (post.termFinal.level) !== typeof (1))
        throw new ErrorHandler(400, 'In term final object there must be a integer field named level');
    if (!post.termFinal.term || typeof (post.termFinal.term) !== typeof (1))
        throw new ErrorHandler(400, 'In term final object there must be a integer field named term');

    if (post.termFinal.level < 1 || post.termFinal.level > 5)
        throw new ErrorHandler(400, 'Invalid Level');
    if (post.termFinal.term < 1 || post.termFinal.term > 2)
        throw new ErrorHandler(400, 'Invalid Term');

    post.customTag.forEach(tag => {
        if (typeof (tag) !== typeof (""))
            throw new ErrorHandler(400, 'In custom tag array there must be a string type element');
    });


    let exist;

    if (post.course) {
        exist = await Tag.isExist(post.course, 'course');
        if (!exist)
            throw new ErrorHandler(400, 'Course not found.');
    }

    if (post.topic) {
        exist = await Tag.isExist(post.topic, 'topic');
        if (!exist)
            throw new ErrorHandler(400, 'Topic not found.');
    }

    if (post.book) {
        exist = await Tag.isExist(post.book, 'book');
        if (!exist)
            throw new ErrorHandler(400, 'Book not found.');
    }
};


const addPostTag = async (postId, post) => {
    if (post.topic)
        await Post.addPostTag(postId, post.topic);
    if (post.book)
        await Post.addPostTag(postId, post.book);
    if (post.course)
        await Post.addPostTag(postId, post.course);

    for (const tag of post.customTag)
        await Post.addPostTag(postId, tag);
}

exports.createPost = async (req, res, next) => {
    try {
        // console.log(req.body);
        const errors = validationResult(req);
        if (!errors.isEmpty())
            throw new ErrorHandler(400, errors);

        await checkPostResources(req.body);
        await checkPostFields(req.body);

        let user = res.locals.middlewareResponse.user;

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

        await addPostTag(postID, req.body);

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
        // console.log(postDetails);

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

        // console.log(postDetails.date);
        postDetails.createdAt = dateTime.create(postDetails.createdAt).getTime();
        // console.log(postDetails.date);

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
            comment.isReported = (await Comment.isReport(comment.commentId, user.id)) != null;
            delete comment.ownerID;
        }

        return res.status(200).send(new SuccessResponse("OK", 200,
            "Post fetched successfully", postDetails));

    } catch (e) {
        next(e);
    }
};

exports.updatePost = async (req, res, next) => {
    try {
        // console.log(req.body);
        const errors = validationResult(req);
        if (!errors.isEmpty())
            throw new ErrorHandler(400, errors);

        const postId = req.params.postId;
        const user = res.locals.middlewareResponse.user;

        await checkPostOwner(postId, user.id);

        await checkPostFields(req.body);

        await Post.updatePost(postId, req.body.type,
            req.body.title, req.body.description,
            req.body.termFinal.level, req.body.termFinal.term,
            req.body.course, req.body.book, req.body.topic);

        await Post.deletePostTag(postId);
        await addPostTag(postId, req.body);

        let prevResources = await Post.getPostFiles(postId);
        prevResources = JSON.parse(JSON.stringify(prevResources));
        // console.log(prevResources);
        // console.log(req.body.resources);
        if (prevResources) {
            for (const resource of prevResources) {
                let found = false;
                for (const newResource of req.body.resources) {
                    if (newResource.link === resource.link && newResource.type === resource.type) {
                        console.log("Found");
                        found = true;
                        break;
                    }
                }

                if (!found) {
                    console.log("Deleting resource ", resource.link);
                    await deleteImage(resource.link);
                }
            }
        }

        await Post.deletePostResource(postId);
        for (const resource of req.body.resources)
            await Post.addPostResource(postId, resource.link, resource.type);

        return res.status(200).send(new SuccessResponse("OK", 200,
            "Post updated successfully", null));

    } catch (e) {
        next(e);
    }
};

exports.deletePost = async (req, res, next) => {
    try {
        const postId = req.params.postId;
        const user = res.locals.middlewareResponse.user;

        await checkPostOwner(postId, user.id);

        await Post.deletePost(postId);

        return res.status(200).send(new SuccessResponse("OK", 200,
            "Post deleted successfully", null));

    } catch (e) {
        next(e);
    }
};

exports.addReport = async (req, res, next) => {
    try {
        const postId = req.params.postId;
        const user = res.locals.middlewareResponse.user;

        const postExist = await Post.isPostExist(postId);
        if (!postExist)
            throw new ErrorHandler(400, 'Post not found.');

        const isOwner = await Post.isPostOwner(postId, user.id);
        if (isOwner)
            throw new ErrorHandler(400, 'You can not add report to your own post.');

        const alreadyReport = await Post.isReport(postId, user.id);
        if (alreadyReport)
            throw new ErrorHandler(400, 'You have already reported this post.');

        await Post.addPostReport(postId, user.id);

        return res.status(200).send(new SuccessResponse("OK", 200,
            "Post has been reported successfully.", null));

    } catch (e) {
        next(e);
    }
};

exports.deleteReport = async (req, res, next) => {
    try {
        const postId = req.params.postId;
        const user = res.locals.middlewareResponse.user;

        const postExist = await Post.isPostExist(postId);
        if (!postExist)
            throw new ErrorHandler(400, 'Post not found.');

        const alreadyReport = await Post.isReport(postId, user.id);
        if (!alreadyReport)
            throw new ErrorHandler(400, 'You have not reported this post.');

        await Post.deletePostReport(postId, user.id);

        return res.status(200).send(new SuccessResponse("OK", 200,
            "Report about this post is deleted successfully.", null));

    } catch (e) {
        next(e);
    }
};

exports.addFollow = async (req, res, next) => {
    try {
        const postId = req.params.postId;
        const user = res.locals.middlewareResponse.user;

        const postExist = await Post.isPostExist(postId);
        if (!postExist)
            throw new ErrorHandler(400, 'Post not found.');

        const isOwner = await Post.isPostOwner(postId, user.id);
        if (isOwner)
            throw new ErrorHandler(400, 'You can not follow to your own post.');

        const alreadyFollow = await Post.isFollow(postId, user.id);
        if (alreadyFollow)
            throw new ErrorHandler(400, 'You have already followed this post.');

        await Post.addPostFollow(postId, user.id);

        return res.status(200).send(new SuccessResponse("OK", 200,
            "You are now following this post.", null));

    } catch (e) {
        next(e);
    }
};

exports.deleteFollow = async (req, res, next) => {
    try {
        const postId = req.params.postId;
        const user = res.locals.middlewareResponse.user;

        const postExist = await Post.isPostExist(postId);
        if (!postExist)
            throw new ErrorHandler(400, 'Post not found.');

        const alreadyFollow = await Post.isFollow(postId, user.id);
        if (!alreadyFollow)
            throw new ErrorHandler(400, 'You have not followed this post.');

        await Post.deletePostFollow(postId, user.id);

        return res.status(200).send(new SuccessResponse("OK", 200,
            "You have unfollowed this post.", null));

    } catch (e) {
        next(e);
    }
};




