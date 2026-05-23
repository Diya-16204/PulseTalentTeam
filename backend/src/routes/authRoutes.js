/**
 * Authentication Routes
 * Handles user registration, login, and profile management
 */

import express from 'express';
import { protect } from '../middleware/auth.js';
import * as authController from '../controllers/authController.js';

const router = express.Router();

/**
 * POST /api/auth/register
 * Register a new user
 * Public route (no authentication required)
 */
router.post('/register', authController.registerUser);

/**
 * POST /api/auth/login
 * Login user and receive JWT token
 * Public route (no authentication required)
 */
router.post('/login', authController.loginUser);

/**
 * Protected Routes (Require Authentication)
 * All routes below require valid JWT token
 */
router.use(protect);

/**
 * GET /api/auth/profile
 * Get current user's profile information
 */
router.get('/profile', authController.getUserProfile);

/**
 * PUT /api/auth/profile
 * Update user profile (firstName, lastName, profilePicture)
 */
router.put('/profile', authController.updateUserProfile);

/**
 * POST /api/auth/change-password
 * Change user password
 */
router.post('/change-password', authController.changePassword);

/**
 * POST /api/auth/logout
 * Logout user (client deletes token)
 */
router.post('/logout', authController.logoutUser);

export default router;
