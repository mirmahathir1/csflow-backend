const Answer = require('../models/answer');

const {validationResult} = require('express-validator');
const {ErrorHandler} = require('../response/error');
const {SuccessResponse} = require('../response/success');
const {deleteImage} = require('../storage/cleanup');

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

