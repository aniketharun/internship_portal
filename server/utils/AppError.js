/**
 * Custom application error class.
 * Extends the native Error with an HTTP statusCode.
 */
class AppError extends Error {
    constructor(message, statusCode) {
        super(message);
        this.statusCode = statusCode;
        this.isOperational = true; // distinguishes operational errors from programming bugs

        Error.captureStackTrace(this, this.constructor);
    }
}

module.exports = AppError;
