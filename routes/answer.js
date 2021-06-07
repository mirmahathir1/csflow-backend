const express = require('express');
const router = express.Router();

const answerController = require('../controllers/answer');
const answerValidators = require('../validations/answer');

const authenticate = require('../middlewares/authenticate');

router.post('/',
    // answerValidators.validateAnswer(),
    authenticate.handleAuthentication,
    answerController.createAnswer,
);

router.get('/',
    authenticate.handleAuthentication,
    answerController.getAnswer,
);

router.patch('/:postId',
    // answerValidators.validatePost(),
    authenticate.handleAuthentication,
    answerController.updatePost,
);

router.delete('/:postId',
    authenticate.handleAuthentication,
    answerController.deletePost,
);

router.post('/:postId/report',
    authenticate.handleAuthentication,
    answerController.addReport,
);

router.delete('/:postId/report',
    authenticate.handleAuthentication,
    answerController.deleteReport,
);

router.post('/:postId/follow',
    authenticate.handleAuthentication,
    answerController.addFollow,
);

router.delete('/:postId/follow',
    authenticate.handleAuthentication,
    answerController.deleteFollow,
);

module.exports = router;