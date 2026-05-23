/**
 * Video Controller
 * Handles video upload, retrieval, and management
 */

import * as videoService from '../services/videoService.js';
import * as sensitivityService from '../services/sensitivityService.js';
import { asyncHandler, AppError } from '../middleware/errorHandler.js';
import { emitToUser, emitToVideoWatchers } from '../utils/socketIO.js';
import { streamVideo } from '../utils/streaming.js';

/**
 * Upload Video
 * POST /api/videos/upload
 * Requires authentication and file
 */
const uploadVideo = asyncHandler(async (req, res, next) => {
  // Check if file was uploaded
  if (!req.file) {
    throw new AppError('No video file provided', 400);
  }

  const { title, description, organization } = req.body;

  // Validate required fields
  if (!title) {
    throw new AppError('Please provide a video title', 400);
  }

  // Process the uploaded video
  const result = await videoService.processUploadedVideo(
    req.file,
    req.user._id,
    {
      title,
      description,
      organization
    }
  );

  // Start background processing with Socket.io updates
  sensitivityService.analyzeVideoSensitivity(result.video._id, {
    emit: (event, data) => {
      emitToUser(req.user._id.toString(), event, data);
      emitToVideoWatchers(result.video._id.toString(), event, data);
    }
  }).catch(error => {
    console.error('Error analyzing video:', error);
  });

  res.status(201).json({
    success: true,
    message: 'Video uploaded successfully. Processing started.',
    data: result.video
  });
});

/**
 * Get User's Videos
 * GET /api/videos
 * Query params: status, safetyStatus, page, limit, sortBy
 * Requires authentication
 */
const getUserVideos = asyncHandler(async (req, res, next) => {
  const filterOptions = {
    status: req.query.status,
    safetyStatus: req.query.safetyStatus,
    page: parseInt(req.query.page) || 1,
    limit: parseInt(req.query.limit) || 10,
    sortBy: req.query.sortBy || '-createdAt',
    startDate: req.query.startDate,
    endDate: req.query.endDate
  };

  const result = await videoService.getUserVideos(req.user._id, filterOptions);

  res.status(200).json({
    success: true,
    message: 'Videos retrieved successfully',
    data: result.videos,
    pagination: result.pagination
  });
});

/**
 * Get Video Details
 * GET /api/videos/:videoId
 * Requires authentication and access permission
 */
const getVideoDetails = asyncHandler(async (req, res, next) => {
  const video = await videoService.getVideoById(req.params.videoId);

  res.status(200).json({
    success: true,
    data: video
  });
});

/**
 * Update Video Metadata
 * PUT /api/videos/:videoId
 * Requires authentication and edit permission
 */
const updateVideo = asyncHandler(async (req, res, next) => {
  const video = await videoService.updateVideoMetadata(req.params.videoId, req.body);

  res.status(200).json({
    success: true,
    message: 'Video updated successfully',
    data: video
  });
});

/**
 * Delete Video
 * DELETE /api/videos/:videoId
 * Requires authentication and ownership
 */
const deleteVideo = asyncHandler(async (req, res, next) => {
  await videoService.deleteVideo(req.params.videoId);

  res.status(200).json({
    success: true,
    message: 'Video deleted successfully'
  });
});

/**
 * Share Video
 * POST /api/videos/:videoId/share
 * Requires authentication and ownership
 */
const shareVideo = asyncHandler(async (req, res, next) => {
  const { recipientId, role } = req.body;

  if (!recipientId) {
    throw new AppError('Please provide recipient user ID', 400);
  }

  if (!['viewer', 'editor'].includes(role)) {
    throw new AppError('Role must be either viewer or editor', 400);
  }

  const video = await videoService.shareVideo(req.params.videoId, recipientId, role);

  res.status(200).json({
    success: true,
    message: 'Video shared successfully',
    data: video
  });
});

/**
 * Revoke Video Share
 * DELETE /api/videos/:videoId/share/:userId
 * Requires authentication and ownership
 */
const revokeVideoShare = asyncHandler(async (req, res, next) => {
  const video = await videoService.revokeVideoShare(req.params.videoId, req.params.userId);

  res.status(200).json({
    success: true,
    message: 'Share revoked successfully',
    data: video
  });
});

/**
 * Stream Video
 * GET /api/videos/:videoId/stream
 * Supports HTTP Range requests
 * Requires authentication and access permission
 */
const streamVideoFile = asyncHandler(async (req, res, next) => {
  const video = await videoService.getVideoById(req.params.videoId);

  if (!video.isStreamable || video.processingStatus !== 'completed') {
    throw new AppError('Video is not ready for streaming', 400);
  }

  // Stream the video file with range support
  streamVideo(req, res, video.filePath, video.mimeType);
});

/**
 * Get Processing Status
 * GET /api/videos/:videoId/processing-status
 * Requires authentication
 */
const getProcessingStatus = asyncHandler(async (req, res, next) => {
  const status = await sensitivityService.getProcessingStatus(req.params.videoId);

  res.status(200).json({
    success: true,
    data: status
  });
});

/**
 * Get Sensitivity Analysis
 * GET /api/videos/:videoId/analysis
 * Requires authentication and access permission
 */
const getSensitivityAnalysis = asyncHandler(async (req, res, next) => {
  const result = await sensitivityService.getSensitivityAnalysis(req.params.videoId);

  res.status(200).json({
    success: true,
    data: result.analysis
  });
});

/**
 * Re-analyze Video
 * POST /api/videos/:videoId/reanalyze
 * Requires authentication and ownership
 */
const reanalyzeVideo = asyncHandler(async (req, res, next) => {
  const result = await sensitivityService.reanalyzeVideo(req.params.videoId);

  // Start background processing
  sensitivityService.analyzeVideoSensitivity(req.params.videoId, {
    emit: (event, data) => {
      emitToUser(req.user._id.toString(), event, data);
      emitToVideoWatchers(req.params.videoId, event, data);
    }
  }).catch(error => {
    console.error('Error reanalyzing video:', error);
  });

  res.status(200).json({
    success: true,
    message: 'Video queued for re-analysis',
    data: result.job
  });
});

/**
 * Dashboard Statistics
 * GET /api/videos/dashboard/stats
 * Requires authentication
 */
const getDashboardStats = asyncHandler(async (req, res, next) => {
  const videos = await videoService.getUserVideos(req.user._id, { limit: 1000 });

  const stats = {
    totalVideos: videos.pagination.total,
    safeVideos: videos.videos.filter(v => v.sensitivityAnalysis.status === 'safe').length,
    flaggedVideos: videos.videos.filter(v => v.sensitivityAnalysis.status === 'flagged').length,
    pendingVideos: videos.videos.filter(v => v.processingStatus === 'pending').length,
    processingVideos: videos.videos.filter(v => v.processingStatus === 'processing').length,
    totalViews: videos.videos.reduce((sum, v) => sum + v.viewCount, 0),
    totalSize: videos.videos.reduce((sum, v) => sum + v.fileSize, 0)
  };

  res.status(200).json({
    success: true,
    data: stats
  });
});

export {
  uploadVideo,
  getUserVideos,
  getVideoDetails,
  updateVideo,
  deleteVideo,
  shareVideo,
  revokeVideoShare,
  streamVideoFile,
  getProcessingStatus,
  getSensitivityAnalysis,
  reanalyzeVideo,
  getDashboardStats
};
