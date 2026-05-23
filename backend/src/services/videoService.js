/**
 * Video Processing Service
 * Handles video upload, storage, and metadata extraction
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import Video from '../models/Video.js';
import ProcessingJob from '../models/ProcessingJob.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Process uploaded video
 * Extracts metadata and initiates sensitivity analysis
 * 
 * @param {object} fileData - File upload data from Multer
 * @param {object} userId - User ID who uploaded
 * @param {object} videoMetadata - Video title and description
 * @returns {Promise<object>} - Created video document
 */
const processUploadedVideo = async (fileData, userId, videoMetadata) => {
  try {
    if (!fileData) {
      throw new Error('No file provided');
    }

    // Create video document
    const video = await Video.create({
      title: videoMetadata.title,
      description: videoMetadata.description || '',
      originalFileName: fileData.originalname,
      storedFileName: fileData.filename,
      filePath: fileData.path,
      fileSize: fileData.size,
      mimeType: fileData.mimetype,
      uploadedBy: userId,
      organization: videoMetadata.organization || 'personal',
      processingStatus: 'pending'
    });

    // Create processing job
    const job = await ProcessingJob.create({
      videoId: video._id,
      status: 'queued',
      priority: 0
    });

    return {
      success: true,
      video: video,
      job: job
    };
  } catch (error) {
    // Clean up uploaded file if video creation fails
    if (fileData && fileData.path) {
      try {
        fs.unlinkSync(fileData.path);
      } catch (unlinkError) {
        console.error('Error deleting file:', unlinkError);
      }
    }
    throw error;
  }
};

/**
 * Get user's videos
 * Retrieves all videos uploaded by a user with filtering
 * 
 * @param {string} userId - User ID
 * @param {object} filterOptions - Filter and sort options
 * @returns {Promise<array>} - Array of video documents
 */
const getUserVideos = async (userId, filterOptions = {}) => {
  try {
    const filter = { uploadedBy: userId, isDeleted: false };

    // Apply status filter if provided
    if (filterOptions.status) {
      filter.processingStatus = filterOptions.status;
    }

    // Apply safety status filter if provided
    if (filterOptions.safetyStatus) {
      filter['sensitivityAnalysis.status'] = filterOptions.safetyStatus;
    }

    // Apply date range filter if provided
    if (filterOptions.startDate || filterOptions.endDate) {
      filter.createdAt = {};
      if (filterOptions.startDate) {
        filter.createdAt.$gte = new Date(filterOptions.startDate);
      }
      if (filterOptions.endDate) {
        filter.createdAt.$lte = new Date(filterOptions.endDate);
      }
    }

    let query = Video.find(filter);

    // Apply sorting
    const sortBy = filterOptions.sortBy || '-createdAt';
    query = query.sort(sortBy);

    // Apply pagination
    const page = filterOptions.page || 1;
    const limit = filterOptions.limit || 10;
    const skip = (page - 1) * limit;
    
    query = query.skip(skip).limit(limit);

    const videos = await query.exec();
    const total = await Video.countDocuments(filter);

    return {
      success: true,
      videos: videos,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit)
      }
    };
  } catch (error) {
    throw error;
  }
};

/**
 * Get video by ID
 * Retrieves a specific video's details
 * 
 * @param {string} videoId - Video ID
 * @returns {Promise<object>} - Video document
 */
const getVideoById = async (videoId) => {
  try {
    const video = await Video.findById(videoId).populate('uploadedBy', 'firstName lastName email');
    if (!video) {
      throw new Error('Video not found');
    }
    return video;
  } catch (error) {
    throw error;
  }
};

/**
 * Update video metadata
 * Updates title, description, and other editable fields
 * 
 * @param {string} videoId - Video ID
 * @param {object} updateData - Data to update
 * @returns {Promise<object>} - Updated video document
 */
const updateVideoMetadata = async (videoId, updateData) => {
  try {
    // Fields that can be updated
    const allowedFields = ['title', 'description', 'tags', 'category', 'isPublic'];
    const filteredData = {};

    for (const key of allowedFields) {
      if (key in updateData) {
        filteredData[key] = updateData[key];
      }
    }

    const video = await Video.findByIdAndUpdate(
      videoId,
      filteredData,
      { new: true, runValidators: true }
    );

    if (!video) {
      throw new Error('Video not found');
    }

    return video;
  } catch (error) {
    throw error;
  }
};

/**
 * Delete video
 * Soft delete - marks as deleted instead of removing
 * 
 * @param {string} videoId - Video ID
 * @returns {Promise<object>} - Deleted video document
 */
const deleteVideo = async (videoId) => {
  try {
    const video = await Video.findById(videoId);
    if (!video) {
      throw new Error('Video not found');
    }

    // Soft delete
    await video.softDelete();

    // Delete physical file
    if (video.filePath && fs.existsSync(video.filePath)) {
      try {
        fs.unlinkSync(video.filePath);
      } catch (unlinkError) {
        console.error('Error deleting video file:', unlinkError);
      }
    }

    return {
      success: true,
      message: 'Video deleted successfully'
    };
  } catch (error) {
    throw error;
  }
};

/**
 * Share video with another user
 * Grants viewer or editor access to another user
 * 
 * @param {string} videoId - Video ID
 * @param {string} recipientId - User ID to share with
 * @param {string} role - Access role (viewer/editor)
 * @returns {Promise<object>} - Updated video document
 */
const shareVideo = async (videoId, recipientId, role = 'viewer') => {
  try {
    const video = await Video.findById(videoId);
    if (!video) {
      throw new Error('Video not found');
    }

    // Check if already shared
    const existingShare = video.sharedWith.find(
      share => share.userId.toString() === recipientId
    );

    if (existingShare) {
      existingShare.role = role;
    } else {
      video.sharedWith.push({
        userId: recipientId,
        role: role
      });
    }

    await video.save();
    return video;
  } catch (error) {
    throw error;
  }
};

/**
 * Revoke video share
 * Removes access for a user
 * 
 * @param {string} videoId - Video ID
 * @param {string} userId - User ID to revoke access from
 * @returns {Promise<object>} - Updated video document
 */
const revokeVideoShare = async (videoId, userId) => {
  try {
    const video = await Video.findById(videoId);
    if (!video) {
      throw new Error('Video not found');
    }

    video.sharedWith = video.sharedWith.filter(
      share => share.userId.toString() !== userId
    );

    await video.save();
    return video;
  } catch (error) {
    throw error;
  }
};

export {
  processUploadedVideo,
  getUserVideos,
  getVideoById,
  updateVideoMetadata,
  deleteVideo,
  shareVideo,
  revokeVideoShare
};
