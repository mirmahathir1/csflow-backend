const Notification = require('../models/notification');

const dateTime = require('node-datetime');

const {ErrorHandler} = require('../response/error');
const {SuccessResponse} = require('../response/success');

exports.getNotification = async (req, res, next) => {
    try {
        const userId = res.locals.middlewareResponse.user.id;
        const notifications = await Notification.getNotifications(userId);

        for (const notification of notifications) {
            notification.date = dateTime.create(notification.date).getTime();
        }

        return res.status(200).send(new SuccessResponse("OK", 200,
            "Notifications fetched successfully", notifications));

    } catch (e) {
        next(e);
    }
};
