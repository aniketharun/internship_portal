const jwt = require('jsonwebtoken');

/**
 * Generate a signed JWT for the given user id.
 * @param {string} id - MongoDB user _id
 * @returns {string} signed JWT
 */
const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRE || '7d',
    });
};

module.exports = generateToken;
