const jwt = require('jsonwebtoken');
const User = require('../models/User');
const AppError = require('../utils/AppError');

/**
 * Protect routes — verifies the JWT from the Authorization header
 * and attaches the user document to req.user.
 */
const protect = async (req, res, next) => {
    try {
        let token;

        // Check for Bearer token in Authorization header
        if (
            req.headers.authorization &&
            req.headers.authorization.startsWith('Bearer')
        ) {
            token = req.headers.authorization.split(' ')[1];
        }

        if (!token) {
            return next(new AppError('Not authorized — no token provided', 401));
        }

        // Verify token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // Attach user to request (exclude password)
        const user = await User.findById(decoded.id);

        if (!user) {
            return next(
                new AppError('User belonging to this token no longer exists', 401)
            );
        }

        req.user = user;
        next();
    } catch (error) {
        return next(new AppError('Not authorized — token invalid', 401));
    }
};

module.exports = protect;
