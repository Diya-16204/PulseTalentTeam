/**
 * Video Model
 * Defines the schema for video documents in MongoDB
 * Includes metadata, processing status, and content analysis results
 */

import mongoose from 'mongoose';

// Define Video schema
const videoSchema = new mongoose.Schema(
  {
    // Video Metadata
    title: {
      type: String,
      required: [true, 'Please provide a video title'],
      trim: true,
      minlength: [3, 'Title must be at least 3 characters'],
      maxlength: [100, 'Title cannot exceed 100 characters']
    },
    description: {
      type: String,
      trim: true,
      maxlength: [500, 'Description cannot exceed 500 characters'],
      default: ''
    },
    originalFileName: {
      type: String,
      required: true
    },
    storedFileName: {
      type: String,
      required: true
    },
    filePath: {
      type: String,
      required: true
    },

    // File Information
    fileSize: {
      type: Number,
      required: true // Size in bytes
    },
    duration: {
      type: Number,
      default: null // Duration in seconds
    },
    format: {
      type: String,
      trim: true
    },
    mimeType: {
      type: String,
      required: true
    },

    // Upload Information
    uploadedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true // Multi-tenancy: Link to user who uploaded
    },
    organization: {
      type: String,
      default: 'personal'
    },

    // Processing Status
    processingStatus: {
      type: String,
      enum: {
        values: ['pending', 'processing', 'completed', 'failed'],
        message: 'Processing status must be pending, processing, completed, or failed'
      },
      default: 'pending'
    },
    processingProgress: {
      type: Number,
      default: 0,
      min: 0,
      max: 100 // Percentage (0-100)
    },
    processingStartedAt: Date,
    processingCompletedAt: Date,
    processingError: {
      type: String,
      default: null
    },

    // Content Sensitivity Analysis
    sensitivityAnalysis: {
      status: {
        type: String,
        enum: ['safe', 'flagged', 'unknown'],
        default: 'unknown'
      },
      confidence: {
        type: Number,
        min: 0,
        max: 100,
        default: 0 // Confidence percentage
      },
      flags: [{
        type: String,
        enum: ['violent', 'explicit', 'hateful', 'harmful', 'other'],
        default: 'other'
      }],
      analysisDetails: {
        type: String,
        default: null
      },
      analyzedAt: Date
    },

    // Streaming Information
    isStreamable: {
      type: Boolean,
      default: false
    },
    streamUrl: {
      type: String,
      default: null
    },

    // Access Control
    isPublic: {
      type: Boolean,
      default: false
    },
    sharedWith: [{
      userId: mongoose.Schema.Types.ObjectId,
      role: {
        type: String,
        enum: ['viewer', 'editor'],
        default: 'viewer'
      }
    }],

    // Views and Engagement
    viewCount: {
      type: Number,
      default: 0
    },
    lastViewedAt: Date,

    // Additional Metadata
    tags: [String],
    category: {
      type: String,
      trim: true,
      default: null
    },

    // Soft Delete Support
    isDeleted: {
      type: Boolean,
      default: false
    },
    deletedAt: Date
  },
  {
    timestamps: true // Adds createdAt and updatedAt automatically
  }
);

/**
 * Indexing for Better Query Performance
 * These indexes improve the speed of queries used frequently
 */
videoSchema.index({ uploadedBy: 1, createdAt: -1 }); // For user's videos
videoSchema.index({ organization: 1, uploadedBy: 1 }); // For multi-tenant queries
videoSchema.index({ processingStatus: 1 }); // For filtering by status
videoSchema.index({ 'sensitivityAnalysis.status': 1 }); // For filtering by safety
videoSchema.index({ isDeleted: 1, uploadedBy: 1 }); // For soft delete queries

/**
 * Query Middleware: Automatically exclude deleted videos
 * Whenever videos are queried, this automatically filters out deleted ones
 */
videoSchema.pre(/^find/, function(next) {
  if (!this.options.includeDeleted) {
    this.where({ isDeleted: false });
  }
  next();
});

/**
 * Instance Method: Mark video as deleted (soft delete)
 * Instead of removing from database, marks as deleted with timestamp
 * 
 * @returns {Promise<object>} - Updated video document
 */
videoSchema.methods.softDelete = async function() {
  this.isDeleted = true;
  this.deletedAt = new Date();
  return await this.save();
};

/**
 * Instance Method: Update processing progress
 * Used to track real-time progress during video analysis
 * 
 * @param {number} progress - Progress percentage (0-100)
 * @param {string} status - Current processing status
 * @returns {Promise<object>} - Updated video document
 */
videoSchema.methods.updateProgress = async function(progress, status) {
  this.processingProgress = Math.min(progress, 100);
  if (status) {
    this.processingStatus = status;
  }
  return await this.save();
};

/**
 * Instance Method: Complete processing
 * Marks video as completed with sensitivity analysis results
 * 
 * @param {object} analysisResults - Results from sensitivity analysis
 * @returns {Promise<object>} - Updated video document
 */
videoSchema.methods.completeProcessing = async function(analysisResults) {
  this.processingStatus = 'completed';
  this.processingProgress = 100;
  this.processingCompletedAt = new Date();
  this.isStreamable = true;
  
  if (analysisResults) {
    this.sensitivityAnalysis = {
      ...this.sensitivityAnalysis,
      ...analysisResults,
      analyzedAt: new Date()
    };
  }
  
  return await this.save();
};

/**
 * Instance Method: Increment view count
 * Called whenever video is viewed/streamed
 */
videoSchema.methods.incrementViewCount = async function() {
  this.viewCount += 1;
  this.lastViewedAt = new Date();
  return await this.save();
};

const Video = mongoose.model('Video', videoSchema);

export default Video;
