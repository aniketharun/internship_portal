const AppError = require('../utils/AppError');

/**
 * Factory function — restricts access to users whose role is in the
 * provided list.
 *
 * Usage in routes:
 *   router.get('/admin', protect, authorizeRoles('admin'), handler);
 *   router.get('/dash',  protect, authorizeRoles('admin', 'recruiter'), handler);
 *
 * @param  {...string} roles - allowed roles
 */
const authorizeRoles = (...roles) => {
    return (req, res, next) => {
        if (!roles.includes(req.user.role)) {
            return next(
                new AppError(
                    `Role '${req.user.role}' is not authorized to access this resource`,
                    403
                )
            );
        }
        next();
    };
};

module.exports = authorizeRoles;
