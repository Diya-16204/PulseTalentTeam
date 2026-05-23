# API Documentation

## Overview
Complete REST API documentation for Pulse Talent Video Streaming Application.

## Base URL
```
http://localhost:5000/api
```

## Authentication
All protected endpoints require JWT token in Authorization header:
```
Authorization: Bearer {token}
```

## Response Format

### Success Response
```json
{
  "success": true,
  "message": "Operation description",
  "data": {},
  "pagination": {}
}
```

### Error Response
```json
{
  "success": false,
  "message": "Error description",
  "status": 400,
  "details": []
}
```

## Status Codes
- `200 OK` - Successful GET, PUT, DELETE
- `201 Created` - Successful POST (resource created)
- `204 No Content` - Successful DELETE (no response body)
- `400 Bad Request` - Invalid input
- `401 Unauthorized` - Missing/invalid token
- `403 Forbidden` - Insufficient permissions
- `404 Not Found` - Resource not found
- `409 Conflict` - Resource already exists
- `413 Payload Too Large` - File too large
- `500 Internal Server Error` - Server error

## Authentication Endpoints

### POST /auth/register
Register a new user account.

**Request:**
```json
{
  "firstName": "John",
  "lastName": "Doe",
  "email": "john@example.com",
  "password": "securePassword123",
  "confirmPassword": "securePassword123"
}
```

**Response (201):**
```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "id": "user_id",
    "firstName": "John",
    "lastName": "Doe",
    "email": "john@example.com",
    "role": "viewer",
    "organization": "personal"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

### POST /auth/login
Login with email and password.

**Request:**
```json
{
  "email": "john@example.com",
  "password": "securePassword123"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "id": "user_id",
    "firstName": "John",
    "lastName": "Doe",
    "email": "john@example.com",
    "role": "viewer",
    "organization": "personal"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

### GET /auth/profile
Get current user's profile. **[Protected]**

**Response (200):**
```json
{
  "success": true,
  "data": {
    "id": "user_id",
    "firstName": "John",
    "lastName": "Doe",
    "email": "john@example.com",
    "role": "editor",
    "organization": "personal",
    "profilePicture": "url",
    "createdAt": "2024-01-01T00:00:00Z",
    "updatedAt": "2024-01-01T00:00:00Z"
  }
}
```

### PUT /auth/profile
Update user profile. **[Protected]**

**Request:**
```json
{
  "firstName": "Jane",
  "lastName": "Doe",
  "profilePicture": "https://..."
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Profile updated successfully",
  "data": { updated user object }
}
```

### POST /auth/change-password
Change user password. **[Protected]**

**Request:**
```json
{
  "currentPassword": "oldPassword123",
  "newPassword": "newPassword123",
  "confirmPassword": "newPassword123"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Password changed successfully"
}
```

### POST /auth/logout
Logout user (token-based). **[Protected]**

**Response (200):**
```json
{
  "success": true,
  "message": "Logout successful. Please delete the token from client side."
}
```

## Video Endpoints

### POST /videos/upload
Upload a new video. **[Protected] [Role: editor, admin]**

**Request:**
```
Content-Type: multipart/form-data

Form Fields:
- video: <file> (required, video file)
- title: string (required, max 100 chars)
- description: string (optional, max 500 chars)
- organization: string (optional)
```

**Response (201):**
```json
{
  "success": true,
  "message": "Video uploaded successfully. Processing started.",
  "data": {
    "id": "video_id",
    "title": "My Video",
    "description": "Description",
    "originalFileName": "video.mp4",
    "fileSize": 1024000,
    "processingStatus": "pending",
    "processingProgress": 0,
    "sensitivityAnalysis": {
      "status": "unknown",
      "confidence": 0,
      "flags": []
    },
    "uploadedBy": "user_id",
    "createdAt": "2024-01-01T00:00:00Z"
  }
}
```

### GET /videos
Get user's videos with filtering. **[Protected]**

**Query Parameters:**
- `page` (integer, default: 1)
- `limit` (integer, default: 10)
- `status` (string: pending, processing, completed, failed)
- `safetyStatus` (string: safe, flagged, unknown)
- `sortBy` (string, default: -createdAt)
- `startDate` (ISO date)
- `endDate` (ISO date)

**Example:**
```
GET /videos?page=1&limit=10&status=completed&safetyStatus=safe
```

**Response (200):**
```json
{
  "success": true,
  "message": "Videos retrieved successfully",
  "data": [ array of video objects ],
  "pagination": {
    "total": 25,
    "page": 1,
    "limit": 10,
    "pages": 3
  }
}
```

### GET /videos/dashboard/stats
Get dashboard statistics. **[Protected]**

**Response (200):**
```json
{
  "success": true,
  "data": {
    "totalVideos": 25,
    "safeVideos": 20,
    "flaggedVideos": 5,
    "pendingVideos": 2,
    "processingVideos": 1,
    "totalViews": 1500,
    "totalSize": 5368709120
  }
}
```

### GET /videos/{videoId}
Get video details. **[Protected]**

**Response (200):**
```json
{
  "success": true,
  "data": {
    "id": "video_id",
    "title": "My Video",
    "description": "Description",
    "originalFileName": "video.mp4",
    "fileSize": 1024000,
    "processingStatus": "completed",
    "processingProgress": 100,
    "sensitivityAnalysis": {
      "status": "safe",
      "confidence": 95,
      "flags": [],
      "analysisDetails": "Video content appears to be safe..."
    },
    "viewCount": 50,
    "uploadedBy": {
      "id": "user_id",
      "firstName": "John",
      "lastName": "Doe",
      "email": "john@example.com"
    },
    "createdAt": "2024-01-01T00:00:00Z"
  }
}
```

### PUT /videos/{videoId}
Update video metadata. **[Protected] [Owner/Editor/Admin]**

**Request:**
```json
{
  "title": "Updated Title",
  "description": "Updated description",
  "tags": ["tag1", "tag2"],
  "category": "tutorial",
  "isPublic": false
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Video updated successfully",
  "data": { updated video object }
}
```

### DELETE /videos/{videoId}
Delete video (soft delete). **[Protected] [Owner/Admin]**

**Response (200):**
```json
{
  "success": true,
  "message": "Video deleted successfully"
}
```

### GET /videos/{videoId}/stream
Stream video with range request support. **[Protected]**

**Headers:**
```
Range: bytes=0-1023 (optional)
```

**Response (200 / 206):**
```
Content-Type: video/mp4
Content-Range: bytes 0-1023/10240 (if range requested)
<video file content>
```

### GET /videos/{videoId}/processing-status
Get video processing status. **[Protected]**

**Response (200):**
```json
{
  "success": true,
  "data": {
    "videoId": "video_id",
    "status": "processing",
    "progress": 45,
    "sensitivityStatus": "unknown",
    "sensitivityConfidence": 0,
    "error": null,
    "jobStatus": "processing",
    "jobProgress": 45,
    "startedAt": "2024-01-01T10:00:00Z",
    "completedAt": null
  }
}
```

### GET /videos/{videoId}/analysis
Get sensitivity analysis results. **[Protected]**

**Response (200):**
```json
{
  "success": true,
  "data": {
    "status": "safe",
    "confidence": 95,
    "flags": [],
    "details": "Video content appears to be safe. No sensitive material detected.",
    "analyzedAt": "2024-01-01T10:05:00Z"
  }
}
```

### POST /videos/{videoId}/reanalyze
Re-analyze video for sensitivity. **[Protected] [Owner/Admin]**

**Response (200):**
```json
{
  "success": true,
  "message": "Video queued for re-analysis",
  "data": { processing job object }
}
```

### POST /videos/{videoId}/share
Share video with another user. **[Protected] [Owner/Admin]**

**Request:**
```json
{
  "recipientId": "user_id",
  "role": "viewer"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Video shared successfully",
  "data": {
    "id": "video_id",
    "sharedWith": [
      {
        "userId": "user_id",
        "role": "viewer"
      }
    ]
  }
}
```

### DELETE /videos/{videoId}/share/{userId}
Revoke video share. **[Protected] [Owner/Admin]**

**Response (200):**
```json
{
  "success": true,
  "message": "Share revoked successfully",
  "data": { updated video object }
}
```

## Error Examples

### 401 Unauthorized
```json
{
  "success": false,
  "message": "Not authorized to access this route - No token provided",
  "status": 401
}
```

### 403 Forbidden
```json
{
  "success": false,
  "message": "User role 'viewer' does not have permission to access this resource. Required roles: editor, admin",
  "status": 403
}
```

### 404 Not Found
```json
{
  "success": false,
  "message": "Video not found",
  "status": 404
}
```

### 400 Bad Request
```json
{
  "success": false,
  "message": "Validation Error",
  "details": ["Invalid file type. Only video files are allowed."],
  "status": 400
}
```

## Rate Limiting

Currently not implemented. Can be added using express-rate-limit.

## Pagination

Pagination parameters:
- `page` - Page number (starts at 1)
- `limit` - Items per page (default: 10)

Response includes pagination metadata:
```json
{
  "pagination": {
    "total": 100,
    "page": 1,
    "limit": 10,
    "pages": 10
  }
}
```

## Filtering

Videos support multiple filters:
- `status` - Processing status
- `safetyStatus` - Sensitivity analysis result
- `startDate` - Upload date range (from)
- `endDate` - Upload date range (to)

Combine filters: `?status=completed&safetyStatus=safe&startDate=2024-01-01`

## Sorting

Use `sortBy` parameter with field name:
- `createdAt` - Sort by upload date
- `title` - Sort by title
- `fileSize` - Sort by file size
- Prefix with `-` for descending: `-createdAt`

Example: `?sortBy=-createdAt` (newest first)

---

**Last Updated**: May 2026
**API Version**: 1.0.0
