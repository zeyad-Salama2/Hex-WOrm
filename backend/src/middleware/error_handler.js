const { CustomAPIError } = require('../errors');
const { StatusCodes } = require('http-status-codes');

const errorHandlerMiddleware = (err, req, res, next) => {
    const isDevelopment = process.env.NODE_ENV !== 'production';
    const statusCode = err?.statusCode || StatusCodes.INTERNAL_SERVER_ERROR;
    const payload = {
        message: err?.message || 'Something went wrong, please try again later',
    };

    if (isDevelopment) {
        payload.error = err?.name || 'Error';
        if (err?.code) {
            payload.code = err.code;
        }
        if (err?.stack) {
            payload.stack = err.stack;
        }
    }

    if (err instanceof CustomAPIError) {
        return res.status(statusCode).json(payload);
    }

    console.error("[errorHandlerMiddleware] unhandled error:", err);
    return res.status(statusCode).json(payload);
}

module.exports = errorHandlerMiddleware
