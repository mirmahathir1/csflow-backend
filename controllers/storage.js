const {ErrorHandler} = require('../response/error');
const {SuccessResponse} = require('../response/success');
const {validationResult} = require('express-validator');

const {uploadAnImage} = require('../storage/storage');
const {deleteImage} = require('../storage/cleanup');

exports.uploadFiles = async (req, res, next) => {
    try {
        let files = [];
        // console.log(req.files);
        if (req.files) {
            for (let i = 0; i < req.files.length; i++) {
                const link = await uploadAnImage(req.files[i], "resources")
                files.push({
                    link,
                    type: req.files[i].mimetype
                });
            }
        }
        else
            return res.status(400).send(new ErrorHandler(404, "No file found"));

        return res.status(200).send(new SuccessResponse(
            "OK", 200,
            "Post created successfully", files));

    } catch (e) {
        next(e);
    }
};

exports.deleteFiles = async (req, res, next) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty())
            throw new ErrorHandler(400, errors);

        // console.log(req.body.links);

        req.body.links.forEach(link => {
            if (typeof (link) !== typeof (""))
                throw new ErrorHandler(400, 'In custom tag array there must be string type element');
        });

        for (const link of req.body.links)
            await deleteImage(link);

        return res.status(200).send(new SuccessResponse("OK", 200,
            "Deleted successfully", null));

    } catch (e) {
        console.log(e);
        next(e);
    }
};
