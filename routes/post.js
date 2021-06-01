const express = require('express');
const router = express.Router();

const postController = require('../controllers/post');
const postValidators = require('../validations/post');

const authenticate = require('../middlewares/authenticate');

router.post('/',
    postValidators.validateCreatePost(),
    authenticate.handleAuthentication,
    postController.createPost,
);

router.get('/:postId',
    authenticate.handleAuthentication,
    postController.getPost,
);

module.exports = router;