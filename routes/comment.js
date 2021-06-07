const express = require('express');
const router = express.Router();

const commentController = require('../controllers/comment');
const commentValidators = require('../validations/comment');

const authenticate = require('../middlewares/authenticate');

router.patch('/:commentId',
    commentValidators.validateComment(),
    authenticate.handleAuthentication,
    commentController.updateComment,
);

router.delete('/:commentId',
    authenticate.handleAuthentication,
    commentController.deleteComment,
);

router.post('/:commentId/report',
    authenticate.handleAuthentication,
    commentController.addReport,
);

router.delete('/:commentId/report',
    authenticate.handleAuthentication,
    commentController.deleteReport,
);

module.exports = router;