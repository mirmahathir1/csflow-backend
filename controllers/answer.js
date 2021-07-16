const Answer = require('../models/answer');
const Post = require('../models/post');
const Comment = require('../models/comment');
const Notification = require('../models/notification');
const User = require('../models/user');

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

const checkAnswerOwner = async (answerId, ownerId) => {
    const answerExist = await Answer.isAnswerExist(answerId);
    if (!answerExist)
        throw new ErrorHandler(400, 'Answer not found.');

    const isOwner = await Answer.isAnswerOwner(answerId, ownerId);
    if (!isOwner)
        throw new ErrorHandler(400, 'You are not allowed to edit this answer');
}

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

exports.updateAnswer = async (req, res, next) => {
    try {
        // console.log(req.body);
        const errors = validationResult(req);
        if (!errors.isEmpty())
            throw new ErrorHandler(400, errors);

        await checkAnswerResources(req.body);

        const answerId = req.params.answerId;
        const user = res.locals.middlewareResponse.user;

        await checkAnswerOwner(answerId, user.id);

        await Answer.updateAnswer(answerId, req.body.description);

        let prevResources = await Answer.getAnswerFiles(answerId);
        if (prevResources) {
            prevResources = JSON.parse(JSON.stringify(prevResources));
            for (const resource of prevResources) {
                let found = false;
                for (const newResource of req.body.files) {
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

        await Answer.deleteAnswerResource(answerId);
        for (const resource of req.body.files)
            await Answer.addAnswerResource(answerId, resource.link, resource.type);

        return res.status(200).send(new SuccessResponse("OK", 200,
            "Answer updated successfully", null));

    } catch (e) {
        next(e);
    }
};

exports.deleteAnswer = async (req, res, next) => {
    try {
        const answerId = req.params.answerId;
        const user = res.locals.middlewareResponse.user;

        await checkAnswerOwner(answerId, user.id);

        await Answer.deleteAnswer(answerId);

        return res.status(200).send(new SuccessResponse("OK", 200,
            "Answer deleted successfully", null));

    } catch (e) {
        next(e);
    }
};

exports.addReport = async (req, res, next) => {
    try {
        const answerId = req.params.answerId;
        const user = res.locals.middlewareResponse.user;

        const answerExist = await Answer.isAnswerExist(answerId);
        if (!answerExist)
            throw new ErrorHandler(400, 'Answer not found.');

        const isOwner = await Answer.isAnswerOwner(answerId, user.id);
        if (isOwner)
            throw new ErrorHandler(400, 'You can not add report to your own answer.');

        const alreadyReport = await Answer.isReport(answerId, user.id);
        if (alreadyReport)
            throw new ErrorHandler(400, 'You have already reported this post.');

        await Answer.addAnswerReport(answerId, user.id);

        return res.status(200).send(new SuccessResponse("OK", 200,
            "Answer has been reported successfully.", null));

    } catch (e) {
        next(e);
    }
};

exports.deleteReport = async (req, res, next) => {
    try {
        const answerId = req.params.answerId;
        const user = res.locals.middlewareResponse.user;

        const answerExist = await Answer.isAnswerExist(answerId);
        if (!answerExist)
            throw new ErrorHandler(400, 'Answer not found.');

        const alreadyReport = await Answer.isReport(answerId, user.id);
        if (!alreadyReport)
            throw new ErrorHandler(400, 'You have not reported in this answer.');

        await Answer.deleteAnswerReport(answerId, user.id);

        return res.status(200).send(new SuccessResponse("OK", 200,
            "Report about this answer is deleted successfully.", null));

    } catch (e) {
        next(e);
    }
};

exports.addFollow = async (req, res, next) => {
    try {
        const answerId = req.params.answerId;
        const user = res.locals.middlewareResponse.user;

        const answerExist = await Answer.isAnswerExist(answerId);
        if (!answerExist)
            throw new ErrorHandler(400, 'Answer not found.');

        const isOwner = await Answer.isAnswerOwner(answerId, user.id);
        if (isOwner)
            throw new ErrorHandler(400, 'You can not follow to your own answer.');

        const alreadyFollow = await Answer.isFollow(answerId, user.id);
        if (alreadyFollow)
            throw new ErrorHandler(400, 'You have already followed this post.');

        await Answer.addAnswerFollow(answerId, user.id);

        return res.status(200).send(new SuccessResponse("OK", 200,
            "You are now following on this answer.", null));

    } catch (e) {
        next(e);
    }
};

exports.deleteFollow = async (req, res, next) => {
    try {
        const answerId = req.params.answerId;
        const user = res.locals.middlewareResponse.user;

        const answerExist = await Answer.isAnswerExist(answerId);
        if (!answerExist)
            throw new ErrorHandler(400, 'Answer not found.');

        const alreadyFollow = await Answer.isFollow(answerId, user.id);
        if (!alreadyFollow)
            throw new ErrorHandler(400, 'You have not followed this post.');

        await Answer.deleteAnswerFollow(answerId, user.id);

        return res.status(200).send(new SuccessResponse("OK", 200,
            "You have unfollowed this answer.", null));

    } catch (e) {
        next(e);
    }
};

exports.addUpVote = async (req, res, next) => {
    try {
        const answerId = req.params.answerId;
        const user = res.locals.middlewareResponse.user;

        const answerExist = await Answer.isAnswerExist(answerId);
        if (!answerExist)
            throw new ErrorHandler(400, 'Answer not found.');

        const alreadyUpVoted = await Answer.isUpVoted(answerId, user.id);
        if (alreadyUpVoted)
            throw new ErrorHandler(400, 'Upvote already given.');

        await Answer.addUpVote(answerId, user.id);

        ///// Notification ///////
        const ownerId = await Answer.getAnswerOwnerID(answerId);
        const postId = (await Answer.getPostID(answerId))[0]['PostID'];
        await Notification.addNotification(ownerId,
            `${user.name} voted your answer.`,`/post/details/${postId}`);
        ///// Notification ///////

        return res.status(200).send(new SuccessResponse("OK", 200,
            "Upvote successful.", null));

    } catch (e) {
        console.log(e)
        next(e);
    }
};

exports.deleteUpVote = async (req, res, next) => {
    try {
        const answerId = req.params.answerId;
        const user = res.locals.middlewareResponse.user;

        const answerExist = await Answer.isAnswerExist(answerId);
        if (!answerExist)
            throw new ErrorHandler(400, 'Answer not found.');

        const alreadyUpVoted = await Answer.isUpVoted(answerId, user.id);
        if (!alreadyUpVoted)
            throw new ErrorHandler(400, 'Upvote not found.');

        await Answer.deleteUpVote(answerId, user.id);

        return res.status(200).send(new SuccessResponse("OK", 200,
            "Upvote deletion successful.", null));

    } catch (e) {
        next(e);
    }
};


exports.addDownVote = async (req, res, next) => {
    try {
        const answerId = req.params.answerId;
        const user = res.locals.middlewareResponse.user;

        const answerExist = await Answer.isAnswerExist(answerId);
        if (!answerExist)
            throw new ErrorHandler(400, 'Answer not found.');

        const alreadyDownVoted = await Answer.isDownVoted(answerId, user.id);
        if (alreadyDownVoted)
            throw new ErrorHandler(400, 'A downvote is already given.');

        await Answer.addDownVote(answerId, user.id);

        ///// Notification ///////
        const ownerId = await Answer.getAnswerOwnerID(answerId);
        const postId = (await Answer.getPostID(answerId))[0]['PostID'];
        await Notification.addNotification(ownerId,
            `${user.name} downvoted your answer.`,`/post/details/${postId}`);
        ///// Notification ///////

        return res.status(200).send(new SuccessResponse("OK", 200,
            "Downvote given successfully.", null));
    } catch (e) {
        next(e);
    }
};

exports.deleteDownVote = async (req, res, next) => {
    try {
        const answerId = req.params.answerId;
        const user = res.locals.middlewareResponse.user;

        const answerExist = await Answer.isAnswerExist(answerId);
        if (!answerExist)
            throw new ErrorHandler(400, 'Answer not found.');

        const alreadyDownVoted = await Answer.isDownVoted(answerId, user.id);
        if (!alreadyDownVoted)
            throw new ErrorHandler(400, 'Downvote not found.');

        await Answer.deleteDownVote(answerId, user.id);

        return res.status(200).send(new SuccessResponse("OK", 200,
            "Downvote removed successfully.", null));

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

        const answerId = req.params.answerId;
        const user = res.locals.middlewareResponse.user;

        const answerExist = await Answer.isAnswerExist(answerId);
        if (!answerExist)
            throw new ErrorHandler(400, 'Answer not found.');

        const identifier = getUniqueIdentifier();
        await Comment.createAnswerComment(answerId, user.id,
            req.body.description, identifier);

        const commentId = await Comment.getCommentIDByIdentifier(identifier);

        return res.status(200).send(new SuccessResponse("OK", 200,
            "Comment given successfully", {commentId}));

    } catch (e) {
        next(e);
    }
};

exports.acceptAnswer = async (req, res, next) => {
    try {
        const answerId = req.params.answerId;
        const user = res.locals.middlewareResponse.user;

        const answersDetails = await Answer.getAnswerDetails(answerId);
        if (!answersDetails)
            throw new ErrorHandler(400, 'Answers not found.');

        const isOwner = await Post.isPostOwner(answersDetails.PostID, user.id);
        if (!isOwner)
            throw new ErrorHandler(400, 'You don’t own this post');

        await Post.acceptAnswer(answersDetails.PostID, answerId);

        ///// Notification ///////
        const ownerId = await Answer.getAnswerOwnerID(answerId);
        const postId = (await Answer.getPostID(answerId))[0]['PostID'];
        await Notification.addNotification(ownerId,
            `${user.name} marked your answer as accepted.`,
            `/post/details/${postId}`);

        const postOwner = await User.getUserDetailsByUserID(ownerId);

        let followers = await Post.getFollowers(postId);
        followers = JSON.parse(JSON.stringify(followers));

        for (const follower of followers) {
            await Notification.addNotification(follower.userId,
                `${user.name} marked an answer as accepted on ${postOwner.Name}’s question.`,
                `/post/details/${postId}`);
        }
        ///// Notification ///////

        return res.status(200).send(new SuccessResponse("OK", 200,
            "Answer accepted successfully", null));

    } catch (e) {
        next(e);
    }
};
