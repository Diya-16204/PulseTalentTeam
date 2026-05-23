/**
 * ProcessingJob Model
 * Tracks video processing jobs for real-time updates
 * Used with Socket.io for live progress updates to clients
 */

import mongoose from 'mongoose';

// Define ProcessingJob schema
const processingJobSchema = new mongoose.Schema(
  {
    // Reference to Video
    videoId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Video',
      required: true,
      unique: true // Only one active job per video
    },

    // Job Status
    status: {
      type: String,
      enum: {
        values: ['queued', 'processing', 'completed', 'failed'],
        message: 'Status must be queued, processing, completed, or failed'
      },
      default: 'queued'
    },

    // Progress Tracking
    progress: {
      type: Number,
      default: 0,
      min: 0,
      max: 100
    },
    currentStep: {
      type: String,
      enum: [
        'initializing',
        'extracting_metadata',
        'analyzing_content',
        'processing_video',
        'finalizing'
      ],
      default: 'initializing'
    },
    stepProgress: {
      type: Number,
      default: 0,
      min: 0,
      max: 100
    },

    // Timing Information
    startedAt: {
      type: Date,
      default: Date.now
    },
    completedAt: Date,
    estimatedTimeRemaining: Number, // In seconds

    // Result Information
    result: {
      sensitivityStatus: {
        type: String,
        enum: ['safe', 'flagged', 'unknown'],
        default: 'unknown'
      },
      flags: [String],
      confidence: Number,
      analysisDetails: String
    },

    // Error Handling
    error: {
      code: String,
      message: String,
      details: String,
      retryable: Boolean
    },

    // Retry Information
    retryCount: {
      type: Number,
      default: 0,
      max: 3
    },
    lastRetryAt: Date,

    // Queue Information
    priority: {
      type: Number,
      default: 0 // Higher number = higher priority
    },
    queuePosition: Number
  },
  {
    timestamps: true
  }
);

/**
 * Instance Method: Update job progress
 * Updates both overall progress and current step
 * 
 * @param {number} progress - Overall progress percentage
 * @param {string} step - Current processing step
 * @param {number} stepProgress - Progress within current step
 * @returns {Promise<object>} - Updated job document
 */
processingJobSchema.methods.updateProgress = async function(progress, step, stepProgress = 0) {
  this.progress = Math.min(progress, 100);
  if (step) {
    this.currentStep = step;
    this.stepProgress = Math.min(stepProgress, 100);
  }
  return await this.save();
};

/**
 * Instance Method: Complete job successfully
 * Marks job as completed with results
 * 
 * @param {object} result - Processing result data
 * @returns {Promise<object>} - Updated job document
 */
processingJobSchema.methods.complete = async function(result) {
  this.status = 'completed';
  this.progress = 100;
  this.completedAt = new Date();
  if (result) {
    this.result = result;
  }
  return await this.save();
};

/**
 * Instance Method: Mark job as failed
 * Records error information for debugging
 * 
 * @param {string} errorMessage - Error message
 * @param {string} errorCode - Error code
 * @param {boolean} retryable - Whether job can be retried
 * @returns {Promise<object>} - Updated job document
 */
processingJobSchema.methods.fail = async function(errorMessage, errorCode, retryable = true) {
  this.status = 'failed';
  this.error = {
    code: errorCode,
    message: errorMessage,
    retryable: retryable,
    details: null
  };
  return await this.save();
};

/**
 * Instance Method: Retry failed job
 * Increments retry count and resets status
 * 
 * @returns {Promise<object>} - Updated job document
 */
processingJobSchema.methods.retry = async function() {
  if (this.retryCount >= 3) {
    throw new Error('Maximum retry attempts reached');
  }
  
  this.retryCount += 1;
  this.lastRetryAt = new Date();
  this.status = 'queued';
  this.progress = 0;
  this.error = undefined;
  return await this.save();
};

const ProcessingJob = mongoose.model('ProcessingJob', processingJobSchema);

export default ProcessingJob;
