const express = require('express');
const router = express.Router();

const notificationController = require('../controllers/notification');
const authenticate = require('../middlewares/authenticate');

router.get('/',
    authenticate.handleAuthentication,
    notificationController.getNotification,
);

module.exports = router;
