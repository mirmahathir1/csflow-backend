const Resourcearchive = require('../models/resourcearchive');
const Thesisarchive = require('../models/thesisarchive');
const ThesisOwner = require('../models/thesisowner');
const Projectarchive = require('../models/projectarchive');
const Projectowner = require('../models/projectowner');
const Coursedetails = require('../models/coursedetails');
const Batch = require('../models/batch');
const User = require('../models/user');
const {validationResult} = require('express-validator');
const {ErrorHandler} = require('../response/error');
const {SuccessResponse} = require('../response/success');

exports.getUsers = async (req, res, next) => {
    try {
        let user = res.locals.middlewareResponse.user;

        let batchid = user.batchID;
        let userDetails = await User.getUserDetailsByBatchID(batchid);
        if (userDetails.length === 0) {
            throw new ErrorHandler(404, "There is no user of this batch currently", null);
        }

        return res.status(200).send(new SuccessResponse("OK", 200, "List of users fetched successfully", userDetails));
    } catch (e) {
        next(e);
    }
};