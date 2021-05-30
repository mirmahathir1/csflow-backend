const express = require('express');

const tagController = require('../controllers/tag');
const tagValidators = require('../validations/tag');

const router = express.Router();

const authenticate = require('../middlewares/authenticate')

router.post('/',
    tagValidators.validateTagRequest(),
    authenticate.handleAuthentication,
    tagController.controlTagRequest,
);

router.get('/',
    authenticate.handleAuthentication,
    tagController.getCourses,
);

router.get('/:course/books',
    authenticate.handleAuthentication,
    tagController.getBooks,
);

router.get('/:course/topics',
    authenticate.handleAuthentication,
    tagController.getTopics,
);

module.exports = router;