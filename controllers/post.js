const Post = require('../models/post');
const Answer = require('../models/answer');
const Comment = require('../models/comment');
const User = require('../models/user');
const Tag = require('../models/tag');
const Notification = require('../models/notification');

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

    if (post.termFinal) {
        if (typeof (post.termFinal) !== typeof ({}))
            throw new ErrorHandler(400, 'TermFinal must be a object type.');
        if (!post.termFinal.level || typeof (post.termFinal.level) !== typeof (1))
            throw new ErrorHandler(400, 'In term final object there must be a integer field named level');
        if (!post.termFinal.term || typeof (post.termFinal.term) !== typeof (1))
            throw new ErrorHandler(400, 'In term final object there must be a integer field named term');

        if (post.termFinal.level < 1 || post.termFinal.level > 5)
            throw new ErrorHandler(400, 'Invalid Level');
        if (post.termFinal.term < 1 || post.termFinal.term > 2)
            throw new ErrorHandler(400, 'Invalid Term');
    }


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

const checkResources = async (resources) => {
    resources.forEach(resource => {
        if (typeof (resource) !== typeof ({}))
            throw new ErrorHandler(400, 'In resources array there must be a object type element');

        if (!resource.link || typeof (resource.link) !== typeof (""))
            throw new ErrorHandler(400, 'A resource must have a string field link.');

        if (!resource.type || typeof (resource.type) !== typeof (""))
            throw new ErrorHandler(400, 'A resource must have a string field type.');
    });
}

const checkPostResources = async (post) => {
    await checkResources(post.resources);
};

const checkAnswerResources = async (answer) => {
    await checkResources(answer.files);
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

        if (!req.body.termFinal) {
            req.body.termFinal = {
                level: 0,
                term: 0
            }
        }

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
            "Post created successfully", {postId: postID}));

    } catch (e) {
        next(e);
    }
};

exports.fetchPost = async (postId, userId) => {
    // console.log(postId);
    const postDetails = await Post.getPostDetails(postId);
    // console.log(postDetails);

    if (!postDetails)
        throw new ErrorHandler(400, 'Post not found.');
    /*
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
        }*/

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

    postDetails.isReported = (await Post.isReport(postId, userId)) != null;
    postDetails.isFollowing = (await Post.isFollow(postId, userId)) != null;

    postDetails.comments = await Comment.getCommentOfAPost(postId);

    for (const comment of postDetails.comments) {
        comment.createdAt = dateTime.create(comment.createdAt).getTime();
        const owner = await User.getUserDetailsByUserID(comment.ownerID);
        if (!owner)
            throw new ErrorHandler(400, 'Comment Owner not found.');
        comment.owner = owner;
        comment.isReported = (await Comment.isReport(comment.commentId, userId)) != null;
        delete comment.ownerID;
    }

    ///////////////////////////////////////
    if ((await Post.isUpVoted(postId, userId)))
        postDetails.voteStatus = 1;
    else if ((await Post.isDownVoted(postId, userId)))
        postDetails.voteStatus = -1;
    else
        postDetails.voteStatus = 0;

    //////////////////////////////////////
    postDetails.UpvoteCount = await Post.getUpVoteCount(postId);
    postDetails.DownvoteCount = await Post.getDownVoteCount(postId);

    delete postDetails.upvoteCount;
    delete postDetails.downvoteCount;

    postDetails.answerCount = await Post.getAnswerCount(postId);
    //////////////////////////////////////

    return postDetails;
}

exports.fetchPosts = async (posts, skip, limit, userId) => {
    posts = JSON.parse(JSON.stringify(posts));
    posts = posts.slice(skip, skip + limit);
    let promises = [];
    for (let post of posts)
        promises.push(this.fetchPost(post.id, userId));
    return await Promise.all(promises);
}

exports.getPost = async (req, res, next) => {
    try {
        let user = res.locals.middlewareResponse.user;
        const postId = req.params.postId;

        const postDetails = await this.fetchPost(postId, user.id);

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
                    if (newResource.link === resource.link &&
                        newResource.type === resource.type) {
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

exports.getAnswer = async (req, res, next) => {
    try {
        const user = res.locals.middlewareResponse.user;
        const postId = req.params.postId;

        const postExist = await Post.isPostExist(postId);
        if (!postExist)
            throw new ErrorHandler(400, 'Post not found.');

        // console.log(postId);
        const answersDetails = await Answer.getAnswerDetailsByPostId(postId);
        // console.log(answersDetails);

        if (!answersDetails)
            throw new ErrorHandler(400, 'Answers not found.');

        console.log(answersDetails);

        for (let answer of answersDetails) {
            const owner = await User.getUserDetailsByUserID(answer.UserID);
            if (!owner)
                throw new ErrorHandler(400, 'Owner not found.');
            delete answer.UserID;
            answer.owner = owner;

            answer.createdAt = dateTime.create(answer.createdAt).getTime();

            answer.files = await Answer.getAnswerFiles(answer.answerId);

            answer.isReported = (await Answer.isReport(answer.answerId, user.id)) != null;
            answer.isFollowing = (await Answer.isFollow(answer.answerId, user.id)) != null;

            answer.comments = await Comment.getCommentOfAnAnswer(answer.answerId);

            for (const comment of answer.comments) {
                comment.createdAt = dateTime.create(comment.createdAt).getTime();
                const owner = await User.getUserDetailsByUserID(comment.ownerID);
                if (!owner)
                    throw new ErrorHandler(400, 'Comment Owner not found.');
                comment.owner = owner;
                comment.isReported = (await Comment.isReport(comment.commentId, user.id)) != null;
                delete comment.ownerID;
            }

            ///////////////////////////////////////
            if ((await Answer.isUpVoted(answer.answerId, user.id)))
                answer.voteStatus = 1;
            else if ((await Answer.isDownVoted(answer.answerId, user.id)))
                answer.voteStatus = -1;
            else
                answer.voteStatus = 0;
            //////////////////////////////////////


            //////////////////////////////////////
            answer.UpvoteCount = await Answer.getUpVoteCount(answer.answerId);
            answer.DownvoteCount = await Answer.getDownVoteCount(answer.answerId);

            delete answer.upvoteCount;
            delete answer.downvoteCount;
            //////////////////////////////////////
        }

        return res.status(200).send(new SuccessResponse("OK", 200,
            "Answers fetched successfully", answersDetails));

    } catch (e) {
        next(e);
    }
};

exports.createAnswer = async (req, res, next) => {
    try {
        // console.log(req.body);
        const errors = validationResult(req);
        if (!errors.isEmpty())
            throw new ErrorHandler(400, errors);

        await checkAnswerResources(req.body);

        const postId = req.params.postId;
        const user = res.locals.middlewareResponse.user;

        const postExist = await Post.isPostExist(postId);
        if (!postExist)
            throw new ErrorHandler(400, 'Post not found.');

        const isQuestion = await Post.isQuestionTypePost(postId);
        if (!isQuestion)
            throw new ErrorHandler(400, 'This is not a question.');


        const identifier = getUniqueIdentifier();
        await Answer.createAnswer(postId, user.id,
            req.body.description, identifier);

        const answerID = await Answer.getAnswerIDByIdentifier(identifier);

        for (const resource of req.body.files)
            await Answer.addAnswerResource(answerID,
                resource.link, resource.type);

        const owner = await User.getUserDetailsByUserID(user.id);

        const payload = {
            answerId: answerID,
            owner
        }

        ///// Notification ///////
        const ownerId = await Post.getPostOwnerID(postId);
        await Notification.addNotification(ownerId,
            `${user.name} answered to your question.`, `/post/details/${postId}`);


        const postOwner = await User.getUserDetailsByUserID(ownerId);

        let followers = await Post.getFollowers(postId);
        followers = JSON.parse(JSON.stringify(followers));

        for (const follower of followers) {
            await Notification.addNotification(follower.userId,
                `${user.name} answered to ${postOwner.Name}’s question.`,
                `/post/details/${postId}`);
        }
        ///// Notification ///////

        return res.status(200).send(new SuccessResponse("OK", 200,
            "Answer posted successfully", payload));

    } catch (e) {
        next(e);
    }
};

exports.createComment = async (req, res, next) => {
    try {
        // console.log(req.body);
        const errors = validationResult(req);
        if (!errors.isEmpty())
            throw new ErrorHandler(400, errors);

        const postId = req.params.postId;
        const user = res.locals.middlewareResponse.user;

        const postExist = await Post.isPostExist(postId);
        if (!postExist)
            throw new ErrorHandler(400, 'Post not found.');

        const identifier = getUniqueIdentifier();
        await Comment.createPostComment(postId, user.id,
            req.body.description, identifier);

        const commentId = await Comment.getCommentIDByIdentifier(identifier);

        ///// Notification ///////
        const ownerId = await Post.getPostOwnerID(postId);
        await Notification.addNotification(ownerId,
            `${user.name} commented on your post.`, `/post/details/${postId}`);

        const postOwner = await User.getUserDetailsByUserID(ownerId);

        let followers = await Post.getFollowers(postId);
        followers = JSON.parse(JSON.stringify(followers));

        for (const follower of followers) {
            await Notification.addNotification(follower.userId,
                `${user.name} commented on ${postOwner.Name}’s post.`,
                `/post/details/${postId}`);
        }
        ///// Notification ///////

        return res.status(200).send(new SuccessResponse("OK", 200,
            "Commented on post successfully", {commentId}));

    } catch (e) {
        console.log(e);
        next(e);
    }
};

exports.getUserPost = async (req, res, next) => {
    try {
        const user = res.locals.middlewareResponse.user;

        const exist = await User.isUser(req.params.userId);
        if (!exist)
            throw new ErrorHandler(400, 'User not found.');

        let posts = await Post.userPost(req.params.userId);
        const payload = await this.fetchPosts(posts, 0, 1000, user.id);

        return res.status(200).send(new SuccessResponse("OK", 200,
            "Post of user id " + req.params.userId + " fetched successfully", payload));

    } catch (e) {
        next(e);
    }
};

exports.getMyPost = async (req, res, next) => {
    try {
        const user = res.locals.middlewareResponse.user;
        console.log(user);
        let posts = await Post.userPost(user.id);
        const payload = await this.fetchPosts(posts, 0, 1000, user.id);

        return res.status(200).send(new SuccessResponse("OK", 200,
            "My Post fetched successfully", payload));

    } catch (e) {
        next(e);
    }
};

exports.addUpVote = async (req, res, next) => {
    try {
        const postId = req.params.postId;
        const user = res.locals.middlewareResponse.user;

        const postExist = await Post.isPostExist(postId);
        if (!postExist)
            throw new ErrorHandler(400, 'Post not found.');

        const alreadyUpVoted = await Post.isUpVoted(postId, user.id);
        if (alreadyUpVoted)
            throw new ErrorHandler(400, 'Upvote already given.');

        await Post.deleteDownVote(postId, user.id);
        await Post.addUpVote(postId, user.id);

        ///// Notification ///////
        const ownerId = await Post.getPostOwnerID(postId);
        await Notification.addNotification(ownerId,
            `${user.name} voted your post.`, `/post/details/${postId}`);
        ///// Notification ///////

        return res.status(200).send(new SuccessResponse("OK", 200,
            "Upvote successful.", null));

    } catch (e) {
        next(e);
    }
};

exports.deleteUpVote = async (req, res, next) => {
    try {
        const postId = req.params.postId;
        const user = res.locals.middlewareResponse.user;

        const postExist = await Post.isPostExist(postId);
        if (!postExist)
            throw new ErrorHandler(400, 'Post not found.');

        const alreadyUpVoted = await Post.isUpVoted(postId, user.id);
        if (!alreadyUpVoted)
            throw new ErrorHandler(400, 'Upvote not found.');

        await Post.deleteUpVote(postId, user.id);

        return res.status(200).send(new SuccessResponse("OK", 200,
            "Upvote deletion successful.", null));

    } catch (e) {
        next(e);
    }
};

exports.addDownVote = async (req, res, next) => {
    try {
        const postId = req.params.postId;
        const user = res.locals.middlewareResponse.user;

        const postExist = await Post.isPostExist(postId);
        if (!postExist)
            throw new ErrorHandler(400, 'Post not found.');

        const alreadyDownVoted = await Post.isDownVoted(postId, user.id);
        if (alreadyDownVoted)
            throw new ErrorHandler(400, 'DownVote already given.');

        await Post.deleteUpVote(postId, user.id);
        await Post.addDownVote(postId, user.id);

        ///// Notification ///////
        const ownerId = await Post.getPostOwnerID(postId);
        await Notification.addNotification(ownerId,
            `${user.name} downvoted your post.`, `/post/details/${postId}`);
        ///// Notification ///////

        return res.status(200).send(new SuccessResponse("OK", 200,
            "Downvote given successfully.", null));

    } catch (e) {
        next(e);
    }
};

exports.deleteDownVote = async (req, res, next) => {
    try {
        const postId = req.params.postId;
        const user = res.locals.middlewareResponse.user;

        const postExist = await Post.isPostExist(postId);
        if (!postExist)
            throw new ErrorHandler(400, 'Post not found.');

        const alreadyDownVoted = await Post.isDownVoted(postId, user.id);
        if (!alreadyDownVoted)
            throw new ErrorHandler(400, 'Down Vote not found.');

        await Post.deleteDownVote(postId, user.id);

        return res.status(200).send(new SuccessResponse("OK", 200,
            "Downvote removed successfully.", null));

    } catch (e) {
        next(e);
    }
};
