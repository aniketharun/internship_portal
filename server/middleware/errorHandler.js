const AppError = require('../utils/AppError');
const fs = require('fs');
const path = require('path');

/**
 * Centralized error-handling middleware.
 * Must have 4 parameters so Express treats it as an error handler.
 */
const errorHandler = (err, req, res, next) => {
    // Default values
    let statusCode = err.statusCode || 500;
    let message = err.message || 'Internal Server Error';

    // ── Mongoose bad ObjectId ──────────────────────────────────────────────
    if (err.name === 'CastError') {
        statusCode = 400;
        message = `Invalid ${err.path}: ${err.value}`;
    }

    // ── Mongoose duplicate key (e.g. duplicate email) ─────────────────────
    if (err.code === 11000) {
        const field = Object.keys(err.keyValue).join(', ');
        statusCode = 400;
        message = `Duplicate field value for: ${field}. Please use another value.`;
    }

    // ── Mongoose validation error ─────────────────────────────────────────
    if (err.name === 'ValidationError') {
        const messages = Object.values(err.errors).map((val) => val.message);
        statusCode = 400;
        message = messages.join('. ');
    }

    // ── JWT errors ────────────────────────────────────────────────────────
    if (err.name === 'JsonWebTokenError') {
        statusCode = 401;
        message = 'Invalid token. Please log in again.';
    }

    if (err.name === 'TokenExpiredError') {
        statusCode = 401;
        message = 'Token expired. Please log in again.';
    }

    // ── Send response ────────────────────────────────────────────────────
    // ── Log to file ──────────────────────────────────────────────────────
    const logPath = path.join(__dirname, '../server_error.log');
    const logMessage = `[${new Date().toISOString()}] ${statusCode} - ${message}\nStack: ${err.stack}\n\n`;
    fs.appendFile(logPath, logMessage, (err) => {
        if (err) console.error('Failed to write to error log', err);
    });

    res.status(statusCode).json({
        success: false,
        error: message,
        ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
    });
};

module.exports = errorHandler;
