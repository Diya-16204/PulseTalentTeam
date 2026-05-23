/**
 * Multer Configuration Module
 * Handles file upload configuration for video files
 */

import multer from 'multer';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configure storage location and filename
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    // Store in uploads folder with user ID subdirectory for multi-tenancy
    const uploadPath = path.join(process.env.UPLOAD_DIR || './uploads', req.user._id.toString());
    fs.mkdirSync(uploadPath, { recursive: true });
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    // Generate unique filename with timestamp
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

// File filter to only accept video files
const fileFilter = (req, file, cb) => {
  // Allowed video MIME types
  const allowedTypes = /video\/(mp4|mpeg|quicktime|x-msvideo|x-matroska|webm)/;
  const allowedExtensions = /\.(mp4|mpeg|mov|avi|mkv|webm)$/i;

  if (allowedTypes.test(file.mimetype) && allowedExtensions.test(file.originalname)) {
    cb(null, true);
  } else {
    cb(new Error(`Invalid file type. Only video files are allowed. Received: ${file.mimetype}`));
  }
};

// Configure multer
const upload = multer({
  storage: storage,
  limits: {
    fileSize: parseInt(process.env.MAX_FILE_SIZE) || 500000000 // 500MB default
  },
  fileFilter: fileFilter
});

export default upload;
