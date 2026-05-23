/**
 * Validation Utilities
 * Helper functions for input validation
 */

/**
 * Validate email format
 * 
 * @param {string} email - Email to validate
 * @returns {boolean} - True if valid email format
 */
const isValidEmail = (email) => {
  const emailRegex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
  return emailRegex.test(email);
};

/**
 * Validate password strength
 * Password must be at least 6 characters with mix of types
 * 
 * @param {string} password - Password to validate
 * @returns {object} - Validation result with details
 */
const validatePasswordStrength = (password) => {
  const checks = {
    minLength: password.length >= 6,
    hasNumbers: /\d/.test(password),
    hasLowercase: /[a-z]/.test(password),
    hasUppercase: /[A-Z]/.test(password),
    hasSpecialChar: /[!@#$%^&*]/.test(password)
  };

  const isStrong = checks.minLength && checks.hasNumbers && checks.hasLowercase;

  return {
    isStrong,
    checks,
    message: isStrong ? 'Password is strong' : 'Password is weak'
  };
};

/**
 * Validate video file
 * Checks if file has valid type and size
 * 
 * @param {object} file - File object from Multer
 * @returns {object} - Validation result
 */
const validateVideoFile = (file) => {
  const maxSize = parseInt(process.env.MAX_FILE_SIZE) || 500000000;
  const allowedMimes = [
    'video/mp4',
    'video/mpeg',
    'video/quicktime',
    'video/x-msvideo',
    'video/x-matroska',
    'video/webm'
  ];

  const isValidSize = file.size <= maxSize;
  const isValidMime = allowedMimes.includes(file.mimetype);
  const isValid = isValidSize && isValidMime;

  return {
    isValid,
    isValidSize,
    isValidMime,
    message: isValid ? 'File is valid' : 'Invalid file'
  };
};

/**
 * Sanitize user input
 * Removes potentially dangerous characters
 * 
 * @param {string} input - Input to sanitize
 * @returns {string} - Sanitized input
 */
const sanitizeInput = (input) => {
  if (typeof input !== 'string') return input;
  
  return input
    .trim()
    .replace(/[<>]/g, '') // Remove angle brackets
    .replace(/"/g, '&quot;') // Escape quotes
    .substring(0, 500); // Limit length
};

export {
  isValidEmail,
  validatePasswordStrength,
  validateVideoFile,
  sanitizeInput
};
