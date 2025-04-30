import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'fallback_secret_key_for_development';
const JWT_EXPIRES_IN = '24h';

/**
 * Generate JWT token for a user
 * @param {Object} user - The user object
 * @returns {String} JWT token
 */
export const generateToken = (user) => {
  const payload = {
    id: user.userId,
    userName: user.userName,
    role: user.role
  };
  
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
};

/**
 * Verify and decode JWT token
 * @param {String} token - JWT token
 * @returns {Object} Decoded token payload
 */
export const verifyToken = (token) => {
  return jwt.verify(token, JWT_SECRET);
};
