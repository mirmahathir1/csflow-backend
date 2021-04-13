class ErrorHandler extends Error {
    constructor(statusCode, message,payload) {
        super();
        this.statusCode = statusCode;
        this.status = "ERROR"
        this.message = message;
        this.payload = payload;
    }
}

const handleError = (err, res) => {
    const { statusCode, message, payload } = err;
    return res.status(statusCode).send({
        statusCode,
        status: "ERROR",
        message,
        payload
    });
};

module.exports = {
    ErrorHandler,
    handleError,
}
