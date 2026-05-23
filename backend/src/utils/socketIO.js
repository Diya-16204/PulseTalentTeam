/**
 * Socket.io Configuration and Handlers
 * Manages real-time communication for progress updates
 */

import { Server } from 'socket.io';

let io;

/**
 * Initialize Socket.io
 * Sets up Socket.io server with CORS and handlers
 * 
 * @param {object} server - HTTP server instance
 * @returns {object} - Socket.io instance
 */
const initializeSocketIO = (server) => {
  const allowedOrigins = (process.env.SOCKET_IO_CORS || process.env.CORS_ORIGIN || 'http://localhost:5173')
    .split(',')
    .map(origin => origin.trim())
    .filter(Boolean);

  io = new Server(server, {
    cors: {
      origin: allowedOrigins,
      methods: ['GET', 'POST'],
      credentials: true
    }
  });

  // Connection handler
  io.on('connection', (socket) => {
    console.log(`✓ User connected: ${socket.id}`);

    // Join user's personal room for targeted updates
    socket.on('join-user', (userId) => {
      socket.join(`user-${userId}`);
      console.log(`User ${socket.id} joined room user-${userId}`);
    });

    // Join video room for progress updates
    socket.on('watch-video', (videoId) => {
      socket.join(`video-${videoId}`);
      console.log(`User ${socket.id} watching video ${videoId}`);
    });

    // Leave video room
    socket.on('stop-watching', (videoId) => {
      socket.leave(`video-${videoId}`);
      console.log(`User ${socket.id} stopped watching video ${videoId}`);
    });

    // Disconnect handler
    socket.on('disconnect', () => {
      console.log(`✗ User disconnected: ${socket.id}`);
    });

    // Error handler
    socket.on('error', (error) => {
      console.error(`Socket error for ${socket.id}:`, error);
    });
  });

  return io;
};

/**
 * Get Socket.io instance
 * Returns the initialized Socket.io instance
 * 
 * @returns {object} - Socket.io instance
 */
const getSocketIO = () => {
  if (!io) {
    throw new Error('Socket.io not initialized');
  }
  return io;
};

/**
 * Emit to user's room
 * Sends event to specific user
 * 
 * @param {string} userId - User ID
 * @param {string} event - Event name
 * @param {object} data - Event data
 */
const emitToUser = (userId, event, data) => {
  if (io) {
    io.to(`user-${userId}`).emit(event, data);
  }
};

/**
 * Emit to video watchers
 * Sends event to all users watching a video
 * 
 * @param {string} videoId - Video ID
 * @param {string} event - Event name
 * @param {object} data - Event data
 */
const emitToVideoWatchers = (videoId, event, data) => {
  if (io) {
    io.to(`video-${videoId}`).emit(event, data);
  }
};

export {
  initializeSocketIO,
  getSocketIO,
  emitToUser,
  emitToVideoWatchers
};
