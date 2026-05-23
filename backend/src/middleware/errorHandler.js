/**
 * Error Handling Middleware
 * Centralizes error handling across the application
 * Provides consistent error response format
 */

/**
 * Middleware: Global Error Handler
 * Catches all errors and returns formatted response
 * Should be used as the last middleware in Express app
 * 
 * @param {Error|object} err - Error object
 * @param {object} req - Express request object
 * @param {object} res - Express response object
 * @param {function} next - Express next middleware function
 */
const errorHandler = (err, req, res, next) => {
  // Log error for debugging
  console.error('Error:', {
    message: err.message,
    stack: err.stack,
    status: err.status || 500
  });

  // Default error object
  let error = {
    status: err.status || 500,
    message: err.message || 'Internal Server Error',
    success: false
  };

  // Handle Mongoose validation errors
  if (err.name === 'ValidationError') {
    const messages = Object.values(err.errors).map(e => e.message);
    error = {
      status: 400,
      message: 'Validation Error',
      details: messages,
      success: false
    };
  }

  // Handle Mongoose cast errors (invalid ObjectId)
  if (err.name === 'CastError') {
    error = {
      status: 400,
      message: `Invalid ${err.path}: ${err.value}`,
      success: false
    };
  }

  // Handle duplicate key errors (unique constraint)
  if (err.code === 11000) {
    const field = Object.keys(err.keyPattern)[0];
    error = {
      status: 409,
      message: `A ${field} with that value already exists`,
      success: false
    };
  }

  // Handle JWT errors
  if (err.name === 'JsonWebTokenError') {
    error = {
      status: 401,
      message: 'Invalid token',
      success: false
    };
  }

  if (err.name === 'TokenExpiredError') {
    error = {
      status: 401,
      message: 'Token expired',
      success: false
    };
  }

  // Handle multer file upload errors
  if (err.name === 'MulterError') {
    if (err.code === 'FILE_TOO_LARGE') {
      error = {
        status: 413,
        message: 'File size exceeds maximum limit',
        success: false
      };
    } else if (err.code === 'LIMIT_FILE_COUNT') {
      error = {
        status: 400,
        message: 'Too many files',
        success: false
      };
    } else {
      error = {
        status: 400,
        message: err.message,
        success: false
      };
    }
  }

  // Handle file validation errors from multer fileFilter
  if (err.message && err.message.includes('Invalid file type')) {
    error = {
      status: 400,
      message: err.message,
      success: false
    };
  }

  // Send error response
  res.status(error.status).json(error);
};

/**
 * Utility: Async Error Handler Wrapper
 * Wraps async route handlers to catch errors and pass to error handler
 * 
 * Usage:
 * router.post('/videos', asyncHandler(uploadVideo));
 * 
 * @param {function} fn - Async function to wrap
 * @returns {function} - Express middleware that handles errors
 */
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

/**
 * Custom Error Class
 * Provides structured error creation
 */
class AppError extends Error {
  constructor(message, status = 500) {
    super(message);
    this.status = status;
    this.name = 'AppError';
    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * 404 Not Found Handler
 * Handles requests to non-existent routes
 * 
 * @param {object} req - Express request object
 * @param {object} res - Express response object
 */
const notFoundHandler = (req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.originalUrl} not found`,
    status: 404
  });
};

export { errorHandler, asyncHandler, AppError, notFoundHandler };
