/**
 * Video Routes
 * Handles video upload, streaming, and management
 */

import express from 'express';
import { protect } from '../middleware/auth.js';
import { authorize, checkVideoAccess, checkVideoEditAccess } from '../middleware/rbac.js';
import upload from '../config/multer.js';
import * as videoController from '../controllers/videoController.js';

const router = express.Router();

/**
 * Protected Routes (Require Authentication)
 * All routes below require valid JWT token
 */
router.use(protect);

/**
 * POST /api/videos/upload
 * Upload a new video
 * Required: User must have 'editor' or 'admin' role
 * Multer middleware handles file upload
 */
router.post(
  '/upload',
  authorize('viewer', 'editor', 'admin'),
  upload.single('video'),
  videoController.uploadVideo
);

/**
 * GET /api/videos
 * Get all videos for the authenticated user
 * Supports filtering and pagination
 */
router.get('/', videoController.getUserVideos);

/**
 * GET /api/videos/dashboard/stats
 * Get dashboard statistics for user's videos
 * Place this before /:videoId to avoid route conflict
 */
router.get('/dashboard/stats', videoController.getDashboardStats);

/**
 * GET /api/videos/:videoId
 * Get detailed information about a specific video
 * User must have access (owner, shared with, or public)
 */
router.get('/:videoId', checkVideoAccess, videoController.getVideoDetails);

/**
 * PUT /api/videos/:videoId
 * Update video metadata (title, description, tags, etc.)
 * User must be owner or have editor access
 */
router.put(
  '/:videoId',
  checkVideoAccess,
  checkVideoEditAccess,
  videoController.updateVideo
);

/**
 * DELETE /api/videos/:videoId
 * Delete a video (soft delete)
 * User must be owner or admin
 */
router.delete(
  '/:videoId',
  checkVideoAccess,
  checkVideoEditAccess,
  videoController.deleteVideo
);

/**
 * POST /api/videos/:videoId/share
 * Share video with another user
 * Body: { recipientId, role: 'viewer' | 'editor' }
 * User must be owner or admin
 */
router.post(
  '/:videoId/share',
  checkVideoAccess,
  checkVideoEditAccess,
  videoController.shareVideo
);

/**
 * DELETE /api/videos/:videoId/share/:userId
 * Revoke share access for a user
 * User must be owner or admin
 */
router.delete(
  '/:videoId/share/:userId',
  checkVideoAccess,
  checkVideoEditAccess,
  videoController.revokeVideoShare
);

/**
 * GET /api/videos/:videoId/stream
 * Stream video file with HTTP range request support
 * User must have access to video
 */
router.get('/:videoId/stream', checkVideoAccess, videoController.streamVideoFile);

/**
 * GET /api/videos/:videoId/processing-status
 * Get current processing status and progress
 * Returns progress percentage and sensitivity analysis status
 */
router.get('/:videoId/processing-status', checkVideoAccess, videoController.getProcessingStatus);

/**
 * GET /api/videos/:videoId/analysis
 * Get detailed sensitivity analysis results
 */
router.get('/:videoId/analysis', checkVideoAccess, videoController.getSensitivityAnalysis);

/**
 * POST /api/videos/:videoId/reanalyze
 * Re-analyze video for sensitivity content
 * User must be owner or admin
 */
router.post(
  '/:videoId/reanalyze',
  checkVideoAccess,
  checkVideoEditAccess,
  videoController.reanalyzeVideo
);

export default router;
