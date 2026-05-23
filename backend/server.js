/**
 * Main Express Server
 * Initializes and configures the backend application
 */

import dotenv from 'dotenv';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { createServer } from 'http';
import path from 'path';
import { fileURLToPath } from 'url';
import connectDB from './src/config/database.js';
import { initializeSocketIO } from './src/utils/socketIO.js';
import authRoutes from './src/routes/authRoutes.js';
import videoRoutes from './src/routes/videoRoutes.js';
import { errorHandler, notFoundHandler } from './src/middleware/errorHandler.js';

// Load environment variables
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '.env') });

// Initialize Express app
const app = express();
const server = createServer(app);
const allowedOrigins = (process.env.CORS_ORIGIN || 'http://localhost:5173')
  .split(',')
  .map(origin => origin.trim())
  .filter(Boolean);

// ============================================
// MIDDLEWARE SETUP
// ============================================

// Security Middleware
app.use(helmet()); // Adds security headers

// CORS Middleware
app.use(cors({
  origin: allowedOrigins,
  credentials: true,
  optionsSuccessStatus: 200
}));

// Body Parser Middleware
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Static File Serving
app.use('/uploads', express.static('uploads'));

// ============================================
// DATABASE CONNECTION
// ============================================

console.log('\n═════════════════════════════════════════');
console.log('🚀 Starting Pulse Talent Backend Server');
console.log('═════════════════════════════════════════\n');

connectDB()
  .then(() => {
    console.log('✓ Database connected successfully');
  })
  .catch((error) => {
    console.error('✗ Database connection failed:', error.message);
    process.exit(1);
  });

// ============================================
// SOCKET.IO INITIALIZATION
// ============================================

const io = initializeSocketIO(server);
console.log('✓ Socket.io initialized for real-time updates');

// ============================================
// API ROUTES
// ============================================

/**
 * Health Check Endpoint
 * GET /api/health
 * Returns server status
 */
app.get('/api/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Server is running',
    timestamp: new Date(),
    uptime: process.uptime()
  });
});

/**
 * API Routes
 */
app.use('/api/auth', authRoutes);
app.use('/api/videos', videoRoutes);

// ============================================
// ERROR HANDLING
// ============================================

// 404 Handler for undefined routes
app.use(notFoundHandler);

// Global Error Handler (must be last middleware)
app.use(errorHandler);

// ============================================
// SERVER STARTUP
// ============================================

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`\n✓ Server running on http://localhost:${PORT}`);
  console.log(`✓ WebSocket ready for real-time updates`);
  console.log(`✓ Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`✓ CORS origin: ${allowedOrigins.join(', ')}`);
  console.log('\n═════════════════════════════════════════');
  console.log('📋 Available Endpoints:');
  console.log('═════════════════════════════════════════');
  console.log('Auth Routes:');
  console.log('  POST   /api/auth/register      - Register new user');
  console.log('  POST   /api/auth/login         - Login user');
  console.log('  GET    /api/auth/profile       - Get user profile');
  console.log('  PUT    /api/auth/profile       - Update profile');
  console.log('  POST   /api/auth/change-password - Change password');
  console.log('\nVideo Routes:');
  console.log('  POST   /api/videos/upload      - Upload video');
  console.log('  GET    /api/videos             - List user videos');
  console.log('  GET    /api/videos/:id         - Get video details');
  console.log('  PUT    /api/videos/:id         - Update video');
  console.log('  DELETE /api/videos/:id         - Delete video');
  console.log('  GET    /api/videos/:id/stream  - Stream video');
  console.log('  GET    /api/videos/:id/processing-status - Get status');
  console.log('  GET    /api/videos/:id/analysis        - Get analysis');
  console.log('  POST   /api/videos/:id/share  - Share video');
  console.log('═════════════════════════════════════════\n');
});

// Handle Graceful Shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully...');
  server.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('SIGINT received, shutting down gracefully...');
  server.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
});

// Handle Uncaught Exceptions
process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
  process.exit(1);
});

process.on('unhandledRejection', (error) => {
  console.error('Unhandled Rejection:', error);
  process.exit(1);
});

export default app;
