const jwt = require('jsonwebtoken');

/**
 * Generates a JSON Web Token and attaches it as an HttpOnly cookie to the response.
 * 
 * @param {Object} res - Express response object
 * @param {string|mongoose.Types.ObjectId} customerId - Customer ID to encode in token payload
 * @returns {string} - Generated JWT token
 */
const generateToken = (res, customerId) => {
  const token = jwt.sign(
    { id: customerId },
    process.env.JWT_SECRET || 'shopkart_super_secret_jwt_key_2026',
    {
      expiresIn: process.env.JWT_EXPIRES_IN || '7d'
    }
  );

  // Set JWT inside HttpOnly cookie
  res.cookie('token', token, {
    httpOnly: true, // Prevents XSS attacks by not allowing client JS to access the cookie
    secure: process.env.NODE_ENV === 'production', // Use secure cookies in production (HTTPS)
    sameSite: 'lax', // Protects against CSRF attacks
    maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days in milliseconds
  });

  return token;
};

module.exports = generateToken;
