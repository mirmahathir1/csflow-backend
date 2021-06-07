const Comment = require('../models/comment');

const {validationResult} = require('express-validator');
const {ErrorHandler} = require('../response/error');
const {SuccessResponse} = require('../response/success');

const checkCommentOwner = async (commentId, ownerId) => {
    const commentExist = await Comment.isCommentExist(commentId);
    if (!commentExist)
        throw new ErrorHandler(400, 'Comment not found.');

    const isOwner = await Comment.isCommentOwner(commentId, ownerId);
    if (!isOwner)
        throw new ErrorHandler(400, 'You are not allowed to edit this comment');
}

exports.updateComment = async (req, res, next) => {
    try {
        // console.log(req.body);
        const errors = validationResult(req);
        if (!errors.isEmpty())
            throw new ErrorHandler(400, errors);

        const commentId = req.params.commentId;
        const user = res.locals.middlewareResponse.user;

        await checkCommentOwner(commentId, user.id);

        await Comment.updateComment(commentId, req.body.description);

        return res.status(200).send(new SuccessResponse("OK", 200,
            "Comment updated successfully", null));

    } catch (e) {
        next(e);
    }
};

exports.deleteComment = async (req, res, next) => {
    try {
        const commentId = req.params.commentId;
        const user = res.locals.middlewareResponse.user;

        await checkCommentOwner(commentId, user.id);

        await Comment.deleteComment(commentId);

        return res.status(200).send(new SuccessResponse("OK", 200,
            "Comment deleted successfully", null));

    } catch (e) {
        next(e);
    }
};

exports.addReport = async (req, res, next) => {
    try {
        const commentId = req.params.commentId;
        const user = res.locals.middlewareResponse.user;

        const commentExist = await Comment.isCommentExist(commentId);
        if (!commentExist)
            throw new ErrorHandler(400, 'Comment not found.');

        const isOwner = await Comment.isCommentOwner(commentId, user.id);
        if (isOwner)
            throw new ErrorHandler(400, 'You can not add report to your own comment.');

        const alreadyReport = await Comment.isReport(commentId, user.id);
        if (alreadyReport)
            throw new ErrorHandler(400, 'You have already reported this post.');

        await Comment.addCommentReport(commentId, user.id);

        return res.status(200).send(new SuccessResponse("OK", 200,
            "Comment has been reported successfully.", null));

    } catch (e) {
        next(e);
    }
};

exports.deleteReport = async (req, res, next) => {
    try {
        const commentId = req.params.commentId;
        const user = res.locals.middlewareResponse.user;

        const commentExist = await Comment.isCommentExist(commentId);
        if (!commentExist)
            throw new ErrorHandler(400, 'Comment not found.');

        const alreadyReport = await Comment.isReport(commentId, user.id);
        if (!alreadyReport)
            throw new ErrorHandler(400, 'You have not reported in this comment.');

        await Comment.deleteCommentReport(commentId, user.id);

        return res.status(200).send(new SuccessResponse("OK", 200,
            "Report about this comment is deleted successfully.", null));

    } catch (e) {
        next(e);
    }
};


