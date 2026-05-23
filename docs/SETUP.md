# Setup & Installation Guide

## Prerequisites

Before starting, ensure you have the following installed:

### Required
- **Node.js**: v16 LTS or higher
  - Download from: https://nodejs.org/
  - Verify: `node --version`

- **npm**: Comes with Node.js
  - Verify: `npm --version`

- **MongoDB**: Local or Atlas account
  - Local: https://www.mongodb.com/try/download/community
  - Cloud: https://www.mongodb.com/cloud/atlas (free tier available)

### Optional
- **Git**: For version control
  - Download from: https://git-scm.com/

- **VS Code**: Recommended editor
  - Download from: https://code.visualstudio.com/

## Backend Setup (Detailed)

### Step 1: Navigate to Backend Directory
```bash
cd backend
```

### Step 2: Install Dependencies
```bash
npm install
```

This will install all packages listed in `package.json`:
- express - Web framework
- mongoose - MongoDB ODM
- dotenv - Environment variables
- multer - File uploads
- bcryptjs - Password hashing
- jsonwebtoken - JWT authentication
- socket.io - Real-time communication
- And more...

### Step 3: Create Environment File
```bash
cp .env.example .env
```

### Step 4: Configure Environment Variables

Open `.env` in your editor and update these values:

```env
# ========== DATABASE ==========
# For local MongoDB
MONGODB_URI=mongodb://localhost:27017/pulse-talent

# OR for MongoDB Atlas
# MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/pulse-talent?retryWrites=true&w=majority

# ========== SERVER ==========
PORT=5000
NODE_ENV=development

# ========== AUTHENTICATION ==========
JWT_SECRET=your_very_secure_secret_key_change_this_in_production
JWT_EXPIRE=7d

# ========== FILE UPLOAD ==========
MAX_FILE_SIZE=500000000  # 500MB in bytes
UPLOAD_DIR=./uploads

# ========== CORS ==========
CORS_ORIGIN=http://localhost:5173

# ========== SOCKET.IO ==========
SOCKET_IO_CORS=http://localhost:5173
```

**Important Security Notes:**
- Change `JWT_SECRET` to a strong random value
- Never commit `.env` file to git
- Keep JWT_SECRET private and secure
- In production, use environment variables from hosting platform

### Step 5: Verify MongoDB Connection

**For Local MongoDB:**
```bash
# Start MongoDB service (Windows)
mongod

# Or on Mac
brew services start mongodb-community

# Or on Linux
sudo systemctl start mongod
```

**For MongoDB Atlas:**
1. Create account at https://www.mongodb.com/cloud/atlas
2. Create free tier cluster
3. Get connection string from cluster details
4. Update MONGODB_URI in `.env` with your connection string

### Step 6: Start Backend Server

Development mode (with auto-reload):
```bash
npm run dev
```

Expected output:
```
═════════════════════════════════════════
🚀 Starting Pulse Talent Backend Server
═════════════════════════════════════════

✓ MongoDB Connected: localhost
✓ Server running on http://localhost:5000
✓ WebSocket ready for real-time updates
✓ Environment: development
✓ CORS origin: http://localhost:5173

═════════════════════════════════════════
📋 Available Endpoints:
═════════════════════════════════════════
...
```

### Troubleshooting Backend Issues

**Port Already in Use:**
```bash
# Find and kill process on port 5000
# Windows
netstat -ano | findstr :5000
taskkill /PID <PID> /F

# Mac/Linux
lsof -i :5000
kill -9 <PID>
```

**MongoDB Connection Error:**
- Ensure MongoDB service is running
- Check MONGODB_URI is correct
- If using Atlas, ensure IP whitelist includes your IP
- Verify network connectivity

**Module Not Found:**
```bash
# Reinstall dependencies
rm -rf node_modules
npm install
```

## Frontend Setup (Detailed)

### Step 1: Navigate to Frontend Directory
```bash
cd frontend
```

### Step 2: Install Dependencies
```bash
npm install
```

Installs:
- react & react-dom - UI framework
- react-router-dom - Routing
- axios - HTTP client
- socket.io-client - WebSocket client
- vite - Build tool
- And more...

### Step 3: Create Environment File (Optional)
```bash
cp .env.example .env
```

### Step 4: Start Development Server
```bash
npm run dev
```

Expected output:
```
  VITE v5.0.0  ready in 123 ms

  ➜  Local:   http://localhost:5173/
  ➜  press h to show help
```

### Step 5: Access Application

Open browser and navigate to:
```
http://localhost:5173
```

## Full Stack Setup (Quick Start)

### Using Multiple Terminal Windows

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

**Terminal 3 - MongoDB (if local):**
```bash
mongod
```

Then access:
- Frontend: http://localhost:5173
- Backend: http://localhost:5000

### Using npm scripts (Optional)

Create a root-level `package.json` to manage both:

```json
{
  "scripts": {
    "dev": "concurrently \"npm run dev --prefix backend\" \"npm run dev --prefix frontend\"",
    "install-all": "npm install && npm install --prefix backend && npm install --prefix frontend"
  }
}
```

Then run:
```bash
npm run install-all
npm run dev
```

## Docker Setup (Optional)

### Prerequisites
- Docker installed (https://www.docker.com/products/docker-desktop)

### Create docker-compose.yml

```yaml
version: '3.8'

services:
  mongodb:
    image: mongo:5.0
    container_name: pulse-mongo
    ports:
      - "27017:27017"
    volumes:
      - mongo-data:/data/db
    environment:
      MONGO_INITDB_DATABASE: pulse-talent

  backend:
    build:
      context: ./backend
    container_name: pulse-backend
    ports:
      - "5000:5000"
    depends_on:
      - mongodb
    environment:
      - MONGODB_URI=mongodb://mongodb:27017/pulse-talent
      - PORT=5000
      - JWT_SECRET=your_secret
    volumes:
      - ./backend/uploads:/app/uploads

  frontend:
    build:
      context: ./frontend
    container_name: pulse-frontend
    ports:
      - "5173:5173"
    depends_on:
      - backend
    environment:
      - VITE_API_BASE_URL=http://localhost:5000

volumes:
  mongo-data:
```

### Run with Docker

```bash
docker-compose up
```

## Production Setup

### Backend Production Deployment

1. **Set production environment**
```bash
NODE_ENV=production
```

2. **Use strong JWT secret**
```bash
JWT_SECRET=<generate-strong-random-string>
```

3. **Use MongoDB Atlas**
- Create production cluster
- Update connection string

4. **Deploy to hosting**
- Heroku
- AWS
- Digital Ocean
- Google Cloud
- Azure

Example Heroku deployment:
```bash
heroku create your-app-name
heroku config:set JWT_SECRET=your_secret
heroku config:set MONGODB_URI=your_mongodb_uri
git push heroku main
```

### Frontend Production Deployment

1. **Build application**
```bash
npm run build
```

2. **Deploy to hosting**
- Vercel (recommended for Vite)
- Netlify
- AWS S3 + CloudFront
- GitHub Pages

Example Vercel deployment:
```bash
npm i -g vercel
vercel
```

## Verification Checklist

### Backend
- [ ] MongoDB is running
- [ ] Dependencies installed (`npm install`)
- [ ] `.env` file created with valid configuration
- [ ] Server starts without errors (`npm run dev`)
- [ ] Can access `http://localhost:5000/api/health`

### Frontend
- [ ] Dependencies installed (`npm install`)
- [ ] Development server starts (`npm run dev`)
- [ ] Can access `http://localhost:5173`
- [ ] Registration/Login page displays correctly

### Full Stack
- [ ] Backend and Frontend both running
- [ ] Can register new user
- [ ] Can login with credentials
- [ ] Can upload test video
- [ ] Video processing starts
- [ ] Real-time progress updates appear
- [ ] Video appears in dashboard

## Common Issues & Solutions

### Issue: "ENOENT: no such file or directory, open '.env'"
**Solution:** Copy .env.example to .env
```bash
cp .env.example .env
```

### Issue: "Port 5000 already in use"
**Solution:** Kill the process or change port in `.env`
```bash
# Kill existing process (Mac/Linux)
lsof -i :5000 | grep LISTEN | awk '{print $2}' | xargs kill -9

# Or change port in .env
PORT=5001
```

### Issue: "MongoDB connection refused"
**Solution:** Start MongoDB service
```bash
# Windows
net start MongoDB

# Mac
brew services start mongodb-community

# Linux
sudo systemctl start mongod
```

### Issue: "Cannot find module 'express'"
**Solution:** Reinstall node_modules
```bash
rm -rf node_modules package-lock.json
npm install
```

### Issue: "WebSocket connection failed"
**Solution:** Ensure CORS_ORIGIN matches frontend URL in `.env`

## Next Steps

1. **Create test user account**
   - Go to http://localhost:5173
   - Click Register
   - Create account with email/password

2. **Upload test video**
   - Click "Upload Video" on dashboard
   - Select a video file (mp4, etc.)
   - Watch real-time processing

3. **Explore features**
   - Check dashboard statistics
   - View video details
   - Stream uploaded videos
   - Try filtering and searching

4. **Read documentation**
   - API.md - API endpoints
   - ARCHITECTURE.md - System design
   - USER_GUIDE.md - Feature usage

## Support

For setup issues:
1. Check error messages in console
2. Review troubleshooting section above
3. Verify all prerequisites are installed
4. Check internet connectivity
5. Refer to official documentation links

---

**Last Updated**: May 2026
**Status**: Production Ready
