/**
 * Authentication Service
 * Handles user registration, login, and token management
 */

import User from '../models/User.js';
import { generateToken } from '../middleware/auth.js';

/**
 * Register a new user
 * Validates input and creates new user account
 * 
 * @param {object} userData - User registration data
 * @param {string} userData.firstName - User's first name
 * @param {string} userData.lastName - User's last name
 * @param {string} userData.email - User's email
 * @param {string} userData.password - User's password
 * @returns {Promise<object>} - User document and JWT token
 */
const registerUser = async (userData) => {
  try {
    // Check if user already exists
    const existingUser = await User.findOne({ email: userData.email });
    if (existingUser) {
      throw new Error('Email already registered');
    }

    // Create new user
    const user = await User.create({
      firstName: userData.firstName,
      lastName: userData.lastName,
      email: userData.email,
      password: userData.password,
      role: userData.role || 'viewer',
      organization: userData.organization || 'personal'
    });

    // Generate token
    const token = generateToken(user._id);

    return {
      success: true,
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role,
        organization: user.organization
      },
      token
    };
  } catch (error) {
    throw error;
  }
};

/**
 * Login user
 * Verifies email and password, returns JWT token
 * 
 * @param {string} email - User's email
 * @param {string} password - User's password
 * @returns {Promise<object>} - User document and JWT token
 */
const loginUser = async (email, password) => {
  try {
    // Validate inputs
    if (!email || !password) {
      throw new Error('Please provide email and password');
    }

    // Find user by email, include password field for comparison
    const user = await User.findOne({ email: email.toLowerCase() }).select('+password');

    if (!user) {
      throw new Error('Invalid email or password');
    }

    // Check if password matches
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      throw new Error('Invalid email or password');
    }

    // Update login information
    user.lastLogin = new Date();
    user.loginCount += 1;
    await user.save();

    // Generate token
    const token = generateToken(user._id);

    return {
      success: true,
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role,
        organization: user.organization
      },
      token
    };
  } catch (error) {
    throw error;
  }
};

/**
 * Get user profile
 * Retrieves full user information
 * 
 * @param {string} userId - User ID
 * @returns {Promise<object>} - User document
 */
const getUserProfile = async (userId) => {
  try {
    const user = await User.findById(userId);
    if (!user) {
      throw new Error('User not found');
    }
    return user;
  } catch (error) {
    throw error;
  }
};

/**
 * Update user profile
 * Updates user information (does not change password or role)
 * 
 * @param {string} userId - User ID
 * @param {object} updateData - Data to update
 * @returns {Promise<object>} - Updated user document
 */
const updateUserProfile = async (userId, updateData) => {
  try {
    // Fields that cannot be updated
    delete updateData.password;
    delete updateData.role;
    delete updateData._id;

    const user = await User.findByIdAndUpdate(
      userId,
      updateData,
      { new: true, runValidators: true }
    );

    if (!user) {
      throw new Error('User not found');
    }

    return user;
  } catch (error) {
    throw error;
  }
};

/**
 * Change password
 * Verifies current password before changing to new one
 * 
 * @param {string} userId - User ID
 * @param {string} currentPassword - Current password for verification
 * @param {string} newPassword - New password to set
 * @returns {Promise<object>} - Success response
 */
const changePassword = async (userId, currentPassword, newPassword) => {
  try {
    const user = await User.findById(userId).select('+password');

    if (!user) {
      throw new Error('User not found');
    }

    // Verify current password
    const isValid = await user.comparePassword(currentPassword);
    if (!isValid) {
      throw new Error('Current password is incorrect');
    }

    // Update password
    user.password = newPassword;
    await user.save();

    return {
      success: true,
      message: 'Password changed successfully'
    };
  } catch (error) {
    throw error;
  }
};

export {
  registerUser,
  loginUser,
  getUserProfile,
  updateUserProfile,
  changePassword
};
