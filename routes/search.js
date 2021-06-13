const express = require('express');
const router = express.Router();

const searchController = require('../controllers/search');
const authenticate = require('../middlewares/authenticate');
const searchMiddleware = require('../middlewares/search');

router.get('/',
    authenticate.handleAuthentication,
    searchMiddleware.retrieveSkipAndLimit,
    searchController.getSearchResult,
);

router.get('/topPost/',
    authenticate.handleAuthentication,
    searchMiddleware.retrieveSkipAndLimit,
    searchController.getTopPost,
);

router.get('/relevantPost/',
    authenticate.handleAuthentication,
    searchMiddleware.retrieveSkipAndLimit,
    searchController.getRelevantPost,
);

router.get('/unansweredPost/',
    authenticate.handleAuthentication,
    searchMiddleware.retrieveSkipAndLimit,
    searchController.getUnansweredPost,
);

router.get('/topUser/',
    authenticate.handleAuthentication,
    searchMiddleware.retrieveSkipAndLimit,
    searchController.getTopUser,
);

module.exports = router;