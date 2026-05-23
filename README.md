# Pulse Talent - Video Upload, Sensitivity Processing, and Streaming Application

A comprehensive full-stack application that enables users to upload videos, processes them for content sensitivity analysis, and provides seamless video streaming capabilities with real-time progress tracking.

## 📋 Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Installation](#installation)
- [Configuration](#configuration)
- [Running the Application](#running-the-application)
- [API Documentation](#api-documentation)
- [Architecture](#architecture)
- [User Roles & Permissions](#user-roles--permissions)
- [Real-Time Features](#real-time-features)
- [Deployment](#deployment)
- [Troubleshooting](#troubleshooting)

## ✨ Features

### Core Functionality
- ✅ **Video Upload**: Secure video file upload with validation
- ✅ **Content Analysis**: Automated sensitivity detection (safe/flagged classification)
- ✅ **Real-Time Progress**: Live progress updates via Socket.io
- ✅ **Video Streaming**: HTTP range request support for smooth playback
- ✅ **Multi-Tenant Architecture**: Secure user data isolation
- ✅ **Role-Based Access Control**: Viewer, Editor, Admin roles

### Advanced Features
- ✅ **Video Management**: Upload, edit, delete, and share videos
- ✅ **Advanced Filtering**: Filter by status, safety level, date range
- ✅ **Dashboard Statistics**: View comprehensive usage statistics
- ✅ **Video Sharing**: Share videos with specific permissions (viewer/editor)
- ✅ **Re-Analysis**: Re-run sensitivity analysis on existing videos
- ✅ **Responsive Design**: Works on desktop, tablet, and mobile

## 🛠 Tech Stack

### Backend
- **Runtime**: Node.js (LTS)
- **Framework**: Express.js (REST API)
- **Database**: MongoDB with Mongoose ODM
- **Real-Time**: Socket.io for live updates
- **Authentication**: JWT (JSON Web Tokens)
- **File Upload**: Multer for video handling
- **Validation**: Express-validator
- **Security**: Helmet, CORS, bcryptjs

### Frontend
- **Build Tool**: Vite
- **Framework**: React 18
- **Routing**: React Router v6
- **State Management**: Context API
- **HTTP Client**: Axios
- **Real-Time**: Socket.io Client
- **Styling**: CSS3 (CSS Modules)

## 📁 Project Structure

```
PulseTalentTeam/
├── backend/                          # Backend application
│   ├── src/
│   │   ├── config/                  # Configuration files
│   │   │   ├── database.js          # MongoDB connection
│   │   │   └── multer.js            # File upload config
│   │   ├── models/                  # MongoDB schemas
│   │   │   ├── User.js              # User schema with RBAC
│   │   │   ├── Video.js             # Video metadata schema
│   │   │   └── ProcessingJob.js     # Processing tracking
│   │   ├── controllers/             # Request handlers
│   │   │   ├── authController.js    # Auth endpoints
│   │   │   └── videoController.js   # Video endpoints
│   │   ├── middleware/              # Express middleware
│   │   │   ├── auth.js              # JWT verification
│   │   │   ├── rbac.js              # Role-based access control
│   │   │   └── errorHandler.js      # Error handling
│   │   ├── services/                # Business logic
│   │   │   ├── authService.js       # Auth operations
│   │   │   ├── videoService.js      # Video operations
│   │   │   └── sensitivityService.js# Content analysis
│   │   ├── routes/                  # API routes
│   │   │   ├── authRoutes.js        # Auth endpoints
│   │   │   └── videoRoutes.js       # Video endpoints
│   │   ├── utils/                   # Utility functions
│   │   │   ├── socketIO.js          # WebSocket setup
│   │   │   ├── validators.js        # Input validation
│   │   │   └── streaming.js         # Video streaming
│   │   └── uploads/                 # Video storage
│   ├── server.js                    # Main server file
│   ├── package.json                 # Dependencies
│   └── .env.example                 # Environment template
│
├── frontend/                         # Frontend application
│   ├── src/
│   │   ├── components/              # React components
│   │   │   ├── ProtectedRoute.jsx   # Auth protection
│   │   │   ├── VideoList.jsx        # Video grid
│   │   │   └── DashboardStats.jsx   # Statistics display
│   │   ├── pages/                   # Page components
│   │   │   ├── LoginPage.jsx        # Login interface
│   │   │   ├── RegisterPage.jsx     # Registration
│   │   │   ├── DashboardPage.jsx    # Main dashboard
│   │   │   ├── UploadPage.jsx       # Upload form
│   │   │   └── VideoDetailPage.jsx  # Video player
│   │   ├── services/                # API client
│   │   │   └── api.js               # Axios instance
│   │   ├── context/                 # Context API
│   │   │   └── AuthContext.jsx      # Auth state
│   │   ├── styles/                  # CSS files
│   │   │   ├── auth.css             # Auth pages styles
│   │   │   ├── dashboard.css        # Dashboard styles
│   │   │   ├── upload.css           # Upload page styles
│   │   │   ├── videoList.css        # Video list styles
│   │   │   ├── dashboardStats.css   # Stats styles
│   │   │   ├── videoDetail.css      # Detail page styles
│   │   │   └── theme.js             # Theme variables
│   │   ├── App.jsx                  # Main app component
│   │   └── main.jsx                 # Entry point
│   ├── index.html                   # HTML template
│   ├── vite.config.js               # Vite configuration
│   ├── package.json                 # Dependencies
│   └── .env.example                 # Environment template
│
└── docs/                            # Documentation
    ├── README.md                    # This file
    ├── API.md                       # API documentation
    ├── ARCHITECTURE.md              # Architecture overview
    ├── SETUP.md                     # Setup instructions
    └── USER_GUIDE.md                # User manual
```

## 🚀 Installation

### Prerequisites
- Node.js (v16 or higher)
- MongoDB (local or MongoDB Atlas)
- npm or yarn package manager

### Backend Setup

1. **Navigate to backend directory**
```bash
cd backend
```

2. **Install dependencies**
```bash
npm install
```

3. **Create .env file**
```bash
cp .env.example .env
```

4. **Configure environment variables**
Edit `.env` and set:
- `MONGODB_URI`: MongoDB connection string
- `JWT_SECRET`: Secret key for JWT tokens
- `PORT`: Server port (default: 5000)
- `CORS_ORIGIN`: Frontend URL for CORS

5. **Start the server**
```bash
# Development with auto-reload
npm run dev

# Production
npm start
```

### Frontend Setup

1. **Navigate to frontend directory**
```bash
cd frontend
```

2. **Install dependencies**
```bash
npm install
```

3. **Create .env file** (optional)
```bash
cp .env.example .env
```

4. **Start development server**
```bash
npm run dev
```

The application will be available at `http://localhost:5173`

## ⚙️ Configuration

### Backend Environment Variables

```env
# Database
MONGODB_URI=mongodb://localhost:27017/pulse-talent

# Server
PORT=5000
NODE_ENV=development

# JWT
JWT_SECRET=your_secret_key_here
JWT_EXPIRE=7d

# File Upload
MAX_FILE_SIZE=500000000
UPLOAD_DIR=./uploads

# CORS
CORS_ORIGIN=http://localhost:5173

# Socket.io
SOCKET_IO_CORS=http://localhost:5173
```

### Frontend Environment Variables

```env
VITE_API_BASE_URL=http://localhost:5000
VITE_SOCKET_URL=http://localhost:5000
```

## 📖 Running the Application

### Full Stack Development

**Terminal 1 - Backend:**
```bash
cd backend
npm run dev
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
```

Access the application at:
- Frontend: `http://localhost:5173`
- Backend API: `http://localhost:5000`
- API Documentation: `http://localhost:5000/api/docs` (if Swagger is configured)

## 🔌 API Documentation

### Authentication Endpoints

#### Register User
```
POST /api/auth/register
Content-Type: application/json

{
  "firstName": "John",
  "lastName": "Doe",
  "email": "john@example.com",
  "password": "password123",
  "confirmPassword": "password123"
}

Response: 201 Created
{
  "success": true,
  "message": "User registered successfully",
  "data": { user object },
  "token": "jwt_token"
}
```

#### Login User
```
POST /api/auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "password123"
}

Response: 200 OK
{
  "success": true,
  "message": "Login successful",
  "data": { user object },
  "token": "jwt_token"
}
```

### Video Endpoints

#### Upload Video
```
POST /api/videos/upload
Authorization: Bearer {token}
Content-Type: multipart/form-data

{
  "video": <file>,
  "title": "My Video",
  "description": "Video description"
}

Response: 201 Created
{
  "success": true,
  "message": "Video uploaded successfully. Processing started.",
  "data": { video object }
}
```

#### Get User's Videos
```
GET /api/videos?page=1&limit=10&status=completed&safetyStatus=safe
Authorization: Bearer {token}

Response: 200 OK
{
  "success": true,
  "data": [ array of videos ],
  "pagination": { page, limit, total, pages }
}
```

#### Get Video Details
```
GET /api/videos/{videoId}
Authorization: Bearer {token}

Response: 200 OK
{
  "success": true,
  "data": { video object with full details }
}
```

#### Stream Video
```
GET /api/videos/{videoId}/stream
Authorization: Bearer {token}
Range: bytes=0-1023 (optional for partial content)

Response: 200 OK / 206 Partial Content
<video file content>
```

#### Get Processing Status
```
GET /api/videos/{videoId}/processing-status
Authorization: Bearer {token}

Response: 200 OK
{
  "success": true,
  "data": {
    "videoId": "id",
    "status": "processing",
    "progress": 45,
    "sensitivityStatus": "unknown"
  }
}
```

#### Get Sensitivity Analysis
```
GET /api/videos/{videoId}/analysis
Authorization: Bearer {token}

Response: 200 OK
{
  "success": true,
  "data": {
    "status": "safe",
    "confidence": 95,
    "flags": [],
    "details": "Analysis details"
  }
}
```

For complete API documentation, see [API.md](./docs/API.md)

## 🏗️ Architecture

### Authentication Flow
1. User registers/logs in
2. Server validates credentials and generates JWT token
3. Token stored in localStorage on client
4. Token included in Authorization header for protected requests
5. Server verifies token and sets user context

### Video Processing Pipeline
1. **Upload**: User selects and uploads video file
2. **Validation**: File type, size, and format verified
3. **Storage**: File saved with user organization isolation
4. **Metadata**: Video metadata extracted and stored in database
5. **Processing Job**: ProcessingJob created for tracking
6. **Analysis**: Sensitivity analysis performed asynchronously
7. **Real-Time Updates**: Socket.io emits progress updates
8. **Completion**: Results stored, video marked streamable

### Multi-Tenancy Implementation
- Each user has isolated uploads in separate directories
- Database queries filtered by userId
- Organization field for future enterprise features
- All file paths include user ID for secure access

### Real-Time Communication
- Socket.io established on page load
- User joins personal room: `user-{userId}`
- Video watchers join: `video-{videoId}`
- Server emits updates to relevant rooms
- Client receives real-time progress updates

For detailed architecture documentation, see [ARCHITECTURE.md](./docs/ARCHITECTURE.md)

## 👥 User Roles & Permissions

### Viewer Role
- ✓ View own videos
- ✓ View shared videos (viewer permission)
- ✓ View public videos
- ✓ Stream videos
- ✗ Upload videos
- ✗ Edit videos

### Editor Role
- ✓ All Viewer permissions
- ✓ Upload videos
- ✓ Edit own videos (title, description, tags)
- ✓ Delete own videos
- ✓ Share videos with other users
- ✓ Manage shares

### Admin Role
- ✓ All permissions
- ✓ Access all videos
- ✓ Manage users
- ✓ View system settings
- ✓ View analytics

## 🔄 Real-Time Features

### Processing Progress Updates
```javascript
// Client-side Socket.io listener
socket.on('processing:progress', (data) => {
  console.log(`Video ${data.videoId} is ${data.progress}% complete`);
  console.log(`Current step: ${data.message}`);
});

socket.on('processing:completed', (data) => {
  console.log(`Analysis complete. Status: ${data.result.status}`);
});

socket.on('processing:error', (data) => {
  console.error(`Error: ${data.error}`);
});
```

### Socket.io Events
- `processing:progress` - Video processing progress update
- `processing:completed` - Processing completed successfully
- `processing:error` - Processing encountered an error
- `join-user` - User joins personal notification room
- `watch-video` - User starts watching video
- `stop-watching` - User leaves video room

## 🚢 Deployment

### Backend Deployment (Heroku Example)

1. **Create Heroku app**
```bash
heroku create your-app-name
```

2. **Set environment variables**
```bash
heroku config:set JWT_SECRET=your_secret
heroku config:set MONGODB_URI=your_mongodb_uri
```

3. **Deploy**
```bash
git push heroku main
```

### Frontend Deployment (Vercel Example)

1. **Build the application**
```bash
npm run build
```

2. **Deploy to Vercel**
```bash
npm i -g vercel
vercel
```

3. **Configure environment variables in Vercel dashboard**

For detailed deployment guide, see [SETUP.md](./docs/SETUP.md)

## 🐛 Troubleshooting

### MongoDB Connection Issues
- Verify MongoDB is running
- Check MONGODB_URI in .env
- Ensure network access is allowed (if using MongoDB Atlas)

### Video Upload Fails
- Check file size doesn't exceed MAX_FILE_SIZE
- Verify video format is supported (mp4, mpeg, mov, avi, mkv, webm)
- Ensure uploads directory has write permissions

### Socket.io Connection Issues
- Verify backend and frontend CORS_ORIGIN match
- Check Socket.io port is accessible
- Verify firewall allows WebSocket connections

### Real-Time Updates Not Working
- Ensure Socket.io is initialized on client
- Check browser WebSocket support
- Verify user is authenticated before joining rooms

For more troubleshooting tips, see individual module documentation.

## 📝 Development Standards

### Code Organization
- Controllers handle HTTP requests/responses
- Services contain business logic
- Models define database schemas
- Middleware for cross-cutting concerns
- Utilities for reusable functions

### Error Handling
- Consistent error response format
- Descriptive error messages
- Proper HTTP status codes
- Error logging for debugging

### Security Best Practices
- JWT token validation on protected routes
- Password hashing with bcryptjs
- Role-based access control
- SQL/NoSQL injection prevention
- CORS configuration
- Helmet security headers

### Testing
- Basic integration tests for API endpoints
- Unit tests for services
- Error handling tests

## 📞 Support & Contact

For issues, questions, or suggestions:
1. Check the documentation files in `/docs`
2. Review error messages and logs
3. Check GitHub issues (if repository is public)

## 📄 License

This project is provided for educational and internship purposes.

---

**Last Updated**: May 2026
**Version**: 1.0.0
**Status**: Production Ready
