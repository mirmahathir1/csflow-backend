const {ErrorHandler} = require('../response/error');

const MAX_POST_IN_A_SEARCH = 10;

exports.retrieveSkipAndLimit = async (req, res, next) => {
    try {
        let skip = 0;
        if (req.query.skip)
            skip = parseInt(req.query.skip);
        let limit = MAX_POST_IN_A_SEARCH;
        if (req.query.limit && limit > req.query.limit)
            limit = parseInt(req.query.limit);

        res.locals.middlewareResponse.skip = skip;
        res.locals.middlewareResponse.limit = limit;

        return next();
    } catch (ex) {
        return res.status(401).send(new ErrorHandler(401, "Limit or Skip must be an integer.", null));
    }

}