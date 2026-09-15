const jwt = require('jsonwebtoken');

/**
 * Generates a signed JWT and stores it in an HttpOnly cookie on the response.
 * @param {import('express').Response} res - Express response object
 * @param {string} userId - MongoDB _id of the customer
 */
const generateToken = (res, userId) => {
  const token = jwt.sign(
    { id: userId },
    process.env.JWT_SECRET || 'shopkart_super_secret_jwt_key_2026',
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );

  res.cookie('token', token, {
    httpOnly: true,                              // inaccessible to JS — XSS protection
    secure: process.env.NODE_ENV === 'production', // HTTPS only in prod
    sameSite: 'lax',                             // CSRF mitigation
    maxAge: 7 * 24 * 60 * 60 * 1000,            // 7 days in ms
  });

  return token;
};

module.exports = generateToken;
