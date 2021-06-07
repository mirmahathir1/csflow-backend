const express = require('express');
const router = express.Router();

const searchController = require('../controllers/search');
const authenticate = require('../middlewares/authenticate');

router.get('/',
    authenticate.handleAuthentication,
    searchController.getSearchResult,
);

module.exports = router;