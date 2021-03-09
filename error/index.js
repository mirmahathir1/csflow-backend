class ErrorHandler extends Error {
    constructor(statusCode, message) {
        super();
        this.statusCode = statusCode;
        this.message = message;
    }
}

const handleError = (err, res) => {
    const { statusCode, message } = err;
    return res.status(statusCode).send({
        status: "ERROR",
        statusCode,
        message
    });
};

module.exports = {
    ErrorHandler,
    handleError,
}
