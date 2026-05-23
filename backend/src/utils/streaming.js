/**
 * Streaming Utilities
 * Handles HTTP range requests for video streaming
 */

import fs from 'fs';
import path from 'path';

/**
 * Parse range header
 * Extracts start and end byte positions from HTTP Range header
 * Format: "bytes=start-end"
 * 
 * @param {string} rangeHeader - HTTP Range header value
 * @param {number} fileSize - Total file size in bytes
 * @returns {object} - Start and end byte positions
 */
const parseRange = (rangeHeader, fileSize) => {
  if (!rangeHeader || !rangeHeader.includes('bytes=')) {
    return null;
  }

  const range = rangeHeader.replace(/bytes=/, '').split('-');
  let start = parseInt(range[0], 10);
  let end = range[1] ? parseInt(range[1], 10) : fileSize - 1;

  // Validate range
  if (isNaN(start)) start = 0;
  if (isNaN(end)) end = fileSize - 1;
  if (start > end) {
    return null;
  }

  return { start, end };
};

/**
 * Get range response
 * Prepares response headers for range request
 * 
 * @param {number} start - Start byte position
 * @param {number} end - End byte position
 * @param {number} fileSize - Total file size
 * @returns {object} - Response headers and status code
 */
const getRangeResponse = (start, end, fileSize) => {
  const chunkSize = end - start + 1;

  return {
    status: 206, // Partial Content
    headers: {
      'Content-Range': `bytes ${start}-${end}/${fileSize}`,
      'Content-Length': chunkSize,
      'Content-Type': 'video/mp4', // Adjust based on video type
      'Accept-Ranges': 'bytes',
      'Cache-Control': 'public, max-age=3600'
    },
    start,
    end
  };
};

/**
 * Stream video with range support
 * Sends video file with proper range request handling
 * 
 * @param {object} req - Express request object
 * @param {object} res - Express response object
 * @param {string} filePath - Full path to video file
 * @param {string} mimeType - MIME type of video
 */
const streamVideo = (req, res, filePath, mimeType = 'video/mp4') => {
  try {
    // Check if file exists
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({
        success: false,
        message: 'Video file not found'
      });
    }

    const fileSize = fs.statSync(filePath).size;

    // Parse range header
    const range = parseRange(req.headers.range, fileSize);

    if (range) {
      // Partial content response
      const { start, end, headers, status } = getRangeResponse(range.start, range.end, fileSize);

      res.status(status);
      res.set(headers);

      const stream = fs.createReadStream(filePath, { start, end });
      stream.on('error', (error) => {
        console.error('Stream error:', error);
        if (!res.headersSent) {
          res.status(500).json({
            success: false,
            message: 'Error streaming video'
          });
        }
      });

      stream.pipe(res);
    } else {
      // Full file response
      res.status(200);
      res.set({
        'Content-Length': fileSize,
        'Content-Type': mimeType,
        'Accept-Ranges': 'bytes',
        'Cache-Control': 'public, max-age=3600'
      });

      const stream = fs.createReadStream(filePath);
      stream.on('error', (error) => {
        console.error('Stream error:', error);
        if (!res.headersSent) {
          res.status(500).json({
            success: false,
            message: 'Error streaming video'
          });
        }
      });

      stream.pipe(res);
    }
  } catch (error) {
    console.error('Streaming error:', error);
    res.status(500).json({
      success: false,
      message: 'Error streaming video',
      error: error.message
    });
  }
};

export { parseRange, getRangeResponse, streamVideo };
