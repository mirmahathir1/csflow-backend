const express = require('express');
const router = express.Router();

const postController = require('../controllers/post');
const postValidators = require('../validations/post');

const authenticate = require('../middlewares/authenticate');

router.post('/',
    postValidators.validatePost(),
    authenticate.handleAuthentication,
    postController.createPost,
);

router.get('/:postId',
    authenticate.handleAuthentication,
    postController.getPost,
);

router.patch('/:postId',
    postValidators.validatePost(),
    authenticate.handleAuthentication,
    postController.updatePost,
);

router.delete('/:postId',
    authenticate.handleAuthentication,
    postController.deletePost,
);

router.post('/:postId/report',
    authenticate.handleAuthentication,
    postController.addReport,
);

router.delete('/:postId/report',
    authenticate.handleAuthentication,
    postController.deleteReport,
);

router.post('/:postId/follow',
    authenticate.handleAuthentication,
    postController.addFollow,
);

router.delete('/:postId/follow',
    authenticate.handleAuthentication,
    postController.deleteFollow,
);

router.post('/:postId/answer',
    postValidators.validateAnswer(),
    authenticate.handleAuthentication,
    postController.createAnswer,
);

router.get('/:postId/answer',
    authenticate.handleAuthentication,
    postController.getAnswer,
);

router.post('/:postId/comment',
    postValidators.validateComment(),
    authenticate.handleAuthentication,
    postController.createComment,
);

router.get('/user/me',
    authenticate.handleAuthentication,
    postController.getMyPost,
);

router.get('/user/:userId',
    authenticate.handleAuthentication,
    postController.getUserPost,
);


module.exports = router;