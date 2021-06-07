const express = require('express');
const router = express.Router();

const answerController = require('../controllers/answer');
const answerValidators = require('../validations/answer');

const authenticate = require('../middlewares/authenticate');

router.patch('/:answerId',
    answerValidators.validateAnswer(),
    authenticate.handleAuthentication,
    answerController.updateAnswer,
);

router.delete('/:answerId',
    authenticate.handleAuthentication,
    answerController.deleteAnswer,
);

router.post('/:answerId/report',
    authenticate.handleAuthentication,
    answerController.addReport,
);

router.delete('/:answerId/report',
    authenticate.handleAuthentication,
    answerController.deleteReport,
);

router.post('/:answerId/follow',
    authenticate.handleAuthentication,
    answerController.addFollow,
);

router.delete('/:answerId/follow',
    authenticate.handleAuthentication,
    answerController.deleteFollow,
);

module.exports = router;