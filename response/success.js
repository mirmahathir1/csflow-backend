class SuccessResponse{
    constructor(status, statusCode, message, payload) {
        this.statusCode = statusCode;
        this.message = message;
        this.status = status;
        this.payload = payload
    }
}

module.exports ={
    SuccessResponse
}