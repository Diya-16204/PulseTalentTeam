# Architecture Overview

## System Architecture

### High-Level Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                        FRONTEND (React + Vite)                   │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │ Browser                                                   │   │
│  │  - React Components                                       │   │
│  │  - Context API (Auth State)                              │   │
│  │  - Axios (HTTP Client)                                   │   │
│  │  - Socket.io Client (WebSocket)                          │   │
│  └──────────────────────────────────────────────────────────┘   │
└──────────────┬──────────────────────────────┬────────────────────┘
               │ HTTP/HTTPS                   │ WebSocket
               │ (REST API)                   │ (Real-time)
               ↓                              ↓
┌──────────────────────────────────────────────────────────────────┐
│                   BACKEND (Node.js + Express)                    │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │ API Routes & Controllers                                 │   │
│  │  - Authentication (/auth)                                │   │
│  │  - Video Management (/videos)                            │   │
│  │  - Streaming (/videos/:id/stream)                        │   │
│  └──────────────────────────────────────────────────────────┘   │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │ Middleware Layer                                          │   │
│  │  - JWT Authentication                                    │   │
│  │  - RBAC Authorization                                    │   │
│  │  - Error Handling                                        │   │
│  │  - File Upload (Multer)                                  │   │
│  └──────────────────────────────────────────────────────────┘   │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │ Business Logic (Services)                                 │   │
│  │  - Auth Service                                          │   │
│  │  - Video Service                                         │   │
│  │  - Sensitivity Analysis Service                          │   │
│  └──────────────────────────────────────────────────────────┘   │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │ Data Layer                                                │   │
│  │  - Mongoose Models (User, Video, ProcessingJob)          │   │
│  │  - Database Schemas & Validation                         │   │
│  └──────────────────────────────────────────────────────────┘   │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │ Real-Time Communication (Socket.io)                       │   │
│  │  - Progress Updates                                      │   │
│  │  - Processing Events                                     │   │
│  └──────────────────────────────────────────────────────────┘   │
└──────────────┬──────────────────────────────┬────────────────────┘
               │                              │
               ↓                              ↓
      ┌─────────────────┐           ┌─────────────────┐
      │    MongoDB      │           │  File Storage   │
      │   (Database)    │           │  (Uploads Dir)  │
      └─────────────────┘           └─────────────────┘
```

## Layer Architecture

### 1. Presentation Layer (Frontend)
**Location:** `/frontend/src`

**Components:**
- **Pages**: LoginPage, RegisterPage, DashboardPage, UploadPage, VideoDetailPage
- **Components**: VideoList, DashboardStats, ProtectedRoute
- **Context**: AuthContext (authentication state management)
- **Services**: API client with Axios
- **Styling**: CSS files for different pages

**Responsibilities:**
- Display UI to users
- Handle user interactions
- Make API calls
- Manage authentication state
- Display real-time updates

### 2. API Layer (Routes & Controllers)
**Location:** `/backend/src/routes`, `/backend/src/controllers`

**Components:**
- **Routes**: Define URL endpoints and HTTP methods
- **Controllers**: Handle request/response logic

**Routes:**
```javascript
// Auth Routes
POST   /api/auth/register
POST   /api/auth/login
GET    /api/auth/profile
PUT    /api/auth/profile
POST   /api/auth/change-password

// Video Routes
POST   /api/videos/upload
GET    /api/videos
GET    /api/videos/{id}
PUT    /api/videos/{id}
DELETE /api/videos/{id}
GET    /api/videos/{id}/stream
GET    /api/videos/{id}/processing-status
GET    /api/videos/{id}/analysis
POST   /api/videos/{id}/share
DELETE /api/videos/{id}/share/{userId}
```

**Responsibilities:**
- Map HTTP requests to handlers
- Validate input parameters
- Call appropriate services
- Format and return responses
- Handle errors

### 3. Business Logic Layer (Services)
**Location:** `/backend/src/services`

**Services:**
- **authService.js**: User authentication and profile management
- **videoService.js**: Video upload, retrieval, updates
- **sensitivityService.js**: Content analysis and processing

**Key Methods:**
```javascript
// Auth Service
registerUser()
loginUser()
getUserProfile()
updateUserProfile()
changePassword()

// Video Service
processUploadedVideo()
getUserVideos()
getVideoById()
updateVideoMetadata()
deleteVideo()
shareVideo()

// Sensitivity Service
analyzeVideoSensitivity()
getProcessingStatus()
getSensitivityAnalysis()
reanalyzeVideo()
```

**Responsibilities:**
- Implement business logic
- Handle data transformation
- Call database models
- Manage transactions
- Implement notifications

### 4. Middleware Layer
**Location:** `/backend/src/middleware`

**Middleware Functions:**
- **auth.js**: JWT token verification, token generation
- **rbac.js**: Role-based access control, video access checks
- **errorHandler.js**: Global error handling, custom errors

**Flow:**
```
Request
   ↓
CORS Middleware
   ↓
Body Parser Middleware
   ↓
auth.js (if protected route)
   ↓
rbac.js (if role/permission check needed)
   ↓
Controller Handler
   ↓
Response / Error Handler
```

**Responsibilities:**
- Validate authentication tokens
- Check user permissions
- Handle errors consistently
- Parse request bodies
- Log requests

### 5. Data Layer (Models & Database)
**Location:** `/backend/src/models`

**Models:**
- **User.js**: User schema with authentication
- **Video.js**: Video metadata and processing status
- **ProcessingJob.js**: Processing job tracking

**Database Design:**

**Users Collection:**
```javascript
{
  _id: ObjectId,
  firstName: String,
  lastName: String,
  email: String,
  password: String (hashed),
  role: String (viewer|editor|admin),
  organization: String,
  isActive: Boolean,
  createdAt: Date,
  updatedAt: Date
}
```

**Videos Collection:**
```javascript
{
  _id: ObjectId,
  title: String,
  description: String,
  originalFileName: String,
  storedFileName: String,
  filePath: String,
  fileSize: Number,
  mimeType: String,
  uploadedBy: ObjectId (ref: User),
  processingStatus: String,
  processingProgress: Number,
  sensitivityAnalysis: {
    status: String,
    confidence: Number,
    flags: Array,
    analysisDetails: String
  },
  viewCount: Number,
  isPublic: Boolean,
  sharedWith: Array,
  createdAt: Date,
  updatedAt: Date
}
```

**ProcessingJobs Collection:**
```javascript
{
  _id: ObjectId,
  videoId: ObjectId (ref: Video),
  status: String,
  progress: Number,
  currentStep: String,
  result: Object,
  error: Object,
  retryCount: Number,
  createdAt: Date,
  updatedAt: Date
}
```

**Responsibilities:**
- Define data schemas
- Enforce data validation
- Provide data access methods
- Handle database operations
- Manage relationships

### 6. Infrastructure & Utilities
**Location:** `/backend/src/utils`, `/backend/src/config`

**Components:**
- **socketIO.js**: Socket.io setup and event handlers
- **validators.js**: Input validation utilities
- **streaming.js**: HTTP range request handling
- **database.js**: MongoDB connection
- **multer.js**: File upload configuration

**Responsibilities:**
- Set up external services
- Provide utility functions
- Handle infrastructure concerns
- Manage configuration

## Data Flow

### User Registration Flow
```
1. User fills registration form (Frontend)
2. Frontend sends POST /api/auth/register (Axios)
3. Express routes to authController.registerUser()
4. Service validates input and creates user
5. Password hashed with bcryptjs
6. User saved to MongoDB
7. JWT token generated
8. Response sent with token and user data
9. Frontend stores token in localStorage
10. Redirect to dashboard
```

### Video Upload Flow
```
1. User selects video file (Frontend)
2. Frontend uploads to POST /api/videos/upload (Multer)
3. Multer validates and stores file
4. Controller calls videoService.processUploadedVideo()
5. Video document created in MongoDB
6. ProcessingJob created for tracking
7. Response sent to frontend
8. Background process starts analyzing
9. Socket.io emits progress events
10. Frontend receives real-time updates
11. Analysis complete, database updated
12. Video marked as streamable
```

### Video Streaming Flow
```
1. User clicks play button (Frontend)
2. Video element requests GET /api/videos/:id/stream
3. Backend checks authorization (checkVideoAccess middleware)
4. Backend checks if HTTP Range header present
5. If range header: return 206 Partial Content
6. If no range: return 200 OK with full file
7. File streamed to client
8. Client plays video
9. View count incremented
```

### Real-Time Processing Updates
```
1. Processing job starts (Backend)
2. socketIO.emitToVideoWatchers(videoId, 'processing:progress', data)
3. Event sent to all connected clients in video-{videoId} room
4. Frontend Socket.io listener receives event
5. Frontend updates progress bar and status
6. User sees real-time updates without polling
```

## Security Architecture

### Authentication
- JWT tokens stored in localStorage (frontend)
- Token sent in Authorization header (subsequent requests)
- Server validates token with secret key
- Token expires after 7 days
- Password hashed with bcryptjs (10 salt rounds)

### Authorization
- RBAC middleware checks user role
- Video access verified by ownership or sharing
- Admin role bypasses permission checks
- Soft delete prevents data loss

### Data Protection
- CORS configured for specific origins
- Helmet security headers enabled
- Input validation on all endpoints
- SQL/NoSQL injection prevention
- File upload validated by type and size

### Multi-Tenancy
- Each user can only access own videos
- Organization field for future enterprise
- File uploads organized by userId
- Database queries filtered by uploadedBy

## Scalability Considerations

### Current Implementation
- Single server deployment
- Single database instance
- In-memory Socket.io (no Redis)
- Local file storage

### Scaling Improvements
1. **Database Scaling**
   - MongoDB replica sets for redundancy
   - Database indexing on frequently queried fields
   - Connection pooling with Mongoose

2. **File Storage Scaling**
   - Cloud storage (AWS S3, Google Cloud Storage)
   - CDN integration for fast streaming
   - Video compression and multiple quality levels

3. **Backend Scaling**
   - Load balancing with Nginx/HAProxy
   - Horizontal pod autoscaling (Kubernetes)
   - Redis for Socket.io adapter
   - Message queue for processing jobs (Bull, RabbitMQ)

4. **Frontend Scaling**
   - Static asset caching
   - CDN for JavaScript/CSS
   - Code splitting with React.lazy()
   - Service workers for offline support

## Technology Decisions & Rationale

### Why Express.js?
- Lightweight and flexible
- Large ecosystem of middleware
- Easy to learn and implement
- Perfect for REST APIs

### Why MongoDB?
- Flexible schema for evolving data
- Native JSON-like documents
- Excellent for rapid development
- Built-in replication and sharding

### Why React?
- Component-based architecture
- Large community and ecosystem
- Virtual DOM for performance
- Excellent developer experience

### Why Vite?
- Lightning-fast development server
- Fast build times
- Modern ES modules support
- Excellent HMR (Hot Module Replacement)

### Why Socket.io?
- Real-time bi-directional communication
- Automatic fallback mechanisms
- Room-based broadcasting
- Production-ready library

## Error Handling Strategy

### Error Types
1. **Validation Errors** (400)
   - Invalid input format
   - Missing required fields
   - Constraint violations

2. **Authentication Errors** (401)
   - Invalid/expired token
   - Missing credentials

3. **Authorization Errors** (403)
   - Insufficient permissions
   - Access denied

4. **Not Found Errors** (404)
   - Resource doesn't exist
   - Endpoint not found

5. **Server Errors** (500)
   - Database errors
   - Unexpected exceptions

### Error Response Format
```json
{
  "success": false,
  "message": "Human-readable error message",
  "status": 400,
  "details": ["Additional error details"]
}
```

## Deployment Architecture

### Development Environment
- Local MongoDB
- Express development server (port 5000)
- Vite development server (port 5173)
- HMR enabled

### Production Environment
- MongoDB Atlas cloud database
- Node.js server (Heroku, AWS, etc.)
- Static React build (Vercel, Netlify, etc.)
- SSL/TLS encryption

### CI/CD Pipeline
```
Code Commit
   ↓
GitHub Actions / Jenkins
   ↓
Run Tests
   ↓
Build Application
   ↓
Deploy to Staging
   ↓
Run Integration Tests
   ↓
Deploy to Production
```

---

**Last Updated**: May 2026
**Version**: 1.0.0
**Maintainer**: Development Team
