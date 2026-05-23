/**
 * Authentication Middleware
 * Verifies JWT tokens and authenticates users
 * Protects routes that require authentication
 */

import jwt from 'jsonwebtoken';
import User from '../models/User.js';

const getJwtSecret = () => {
  if (!process.env.JWT_SECRET) {
    throw new Error('JWT_SECRET is not configured. Please set it in backend/.env');
  }

  return process.env.JWT_SECRET;
};

/**
 * Middleware: Verify JWT Token
 * Checks if valid JWT token is provided and sets user in request
 * 
 * @param {object} req - Express request object
 * @param {object} res - Express response object
 * @param {function} next - Express next middleware function
 */
const protect = async (req, res, next) => {
  try {
    let token;

    // Check for token in Authorization header
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    // Video elements cannot attach Authorization headers, so allow a token query
    // only for protected media requests such as /api/videos/:id/stream.
    if (!token && req.query.token && req.originalUrl.includes('/stream')) {
      token = req.query.token;
    }

    // Make sure token exists
    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized to access this route - No token provided'
      });
    }

    try {
      // Verify token
      const decoded = jwt.verify(token, getJwtSecret());
      req.user = await User.findById(decoded.id);

      if (!req.user) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }

      if (!req.user.isActive) {
        return res.status(401).json({
          success: false,
          message: 'User account is inactive'
        });
      }

      next();
    } catch (error) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized to access this route - Invalid token',
        error: error.message
      });
    }
  } catch (error) {
    next(error);
  }
};

/**
 * Utility Function: Generate JWT Token
 * Creates a signed JWT token for a user ID
 * 
 * @param {string} userId - User ID to encode in token
 * @returns {string} - Signed JWT token
 */
const generateToken = (userId) => {
  return jwt.sign({ id: userId }, getJwtSecret(), {
    expiresIn: process.env.JWT_EXPIRE || '7d'
  });
};

export { protect, generateToken };
