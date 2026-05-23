/**
 * Authentication Controller
 * Handles user registration, login, and profile management
 */

import * as authService from '../services/authService.js';
import { asyncHandler, AppError } from '../middleware/errorHandler.js';

/**
 * Register User
 * POST /api/auth/register
 */
const registerUser = asyncHandler(async (req, res, next) => {
  const { firstName, lastName, email, password, confirmPassword } = req.body;

  // Validate input
  if (!firstName || !lastName || !email || !password) {
    throw new AppError('Please provide all required fields', 400);
  }

  if (password !== confirmPassword) {
    throw new AppError('Passwords do not match', 400);
  }

  if (password.length < 6) {
    throw new AppError('Password must be at least 6 characters', 400);
  }

  // Call service
  const result = await authService.registerUser({
    firstName,
    lastName,
    email,
    password
  });

  // Send response
  res.status(201).json({
    success: true,
    message: 'User registered successfully',
    data: result.user,
    token: result.token
  });
});

/**
 * Login User
 * POST /api/auth/login
 */
const loginUser = asyncHandler(async (req, res, next) => {
  const { email, password } = req.body;

  // Validate input
  if (!email || !password) {
    throw new AppError('Please provide email and password', 400);
  }

  // Call service
  const result = await authService.loginUser(email, password);

  // Send response
  res.status(200).json({
    success: true,
    message: 'Login successful',
    data: result.user,
    token: result.token
  });
});

/**
 * Get User Profile
 * GET /api/auth/profile
 * Requires authentication
 */
const getUserProfile = asyncHandler(async (req, res, next) => {
  const user = await authService.getUserProfile(req.user._id);

  res.status(200).json({
    success: true,
    data: user
  });
});

/**
 * Update User Profile
 * PUT /api/auth/profile
 * Requires authentication
 */
const updateUserProfile = asyncHandler(async (req, res, next) => {
  const allowedFields = ['firstName', 'lastName', 'profilePicture'];
  const updateData = {};

  // Only allow specific fields to be updated
  for (const field of allowedFields) {
    if (field in req.body) {
      updateData[field] = req.body[field];
    }
  }

  const user = await authService.updateUserProfile(req.user._id, updateData);

  res.status(200).json({
    success: true,
    message: 'Profile updated successfully',
    data: user
  });
});

/**
 * Change Password
 * POST /api/auth/change-password
 * Requires authentication
 */
const changePassword = asyncHandler(async (req, res, next) => {
  const { currentPassword, newPassword, confirmPassword } = req.body;

  // Validate input
  if (!currentPassword || !newPassword || !confirmPassword) {
    throw new AppError('Please provide all required fields', 400);
  }

  if (newPassword !== confirmPassword) {
    throw new AppError('New passwords do not match', 400);
  }

  if (newPassword.length < 6) {
    throw new AppError('New password must be at least 6 characters', 400);
  }

  // Call service
  await authService.changePassword(req.user._id, currentPassword, newPassword);

  res.status(200).json({
    success: true,
    message: 'Password changed successfully'
  });
});

/**
 * Logout User
 * POST /api/auth/logout
 * Note: Token-based auth requires client-side token deletion
 */
const logoutUser = asyncHandler(async (req, res, next) => {
  res.status(200).json({
    success: true,
    message: 'Logout successful. Please delete the token from client side.'
  });
});

export {
  registerUser,
  loginUser,
  getUserProfile,
  updateUserProfile,
  changePassword,
  logoutUser
};
