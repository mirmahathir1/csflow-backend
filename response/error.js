class ErrorHandler extends Error {
    constructor(statusCode, message) {
        super();
        this.statusCode = statusCode;
        this.status = "ERROR"
        this.message = message;
    }
}

const handleError = (err, res) => {
    const { statusCode, message } = err;
    return res.status(statusCode).send({
        statusCode,
        status: "ERROR",
        message
    });
};

module.exports = {
    ErrorHandler,
    handleError,
}
