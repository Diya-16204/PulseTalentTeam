# Deployment Guide

This project is a two-service app:

- Backend: Node.js, Express, MongoDB, Socket.io, local video storage
- Frontend: React + Vite static site

Recommended assignment deployment:

- Database: MongoDB Atlas
- Backend API: Render Web Service
- Frontend: Vercel

## 1. Prepare MongoDB Atlas

1. Create a MongoDB Atlas account.
2. Create a free or low-cost cluster.
3. Create a database user with username and password.
4. Add network access.
   - For a quick demo, allow `0.0.0.0/0`.
   - For production, restrict to your backend host/network.
5. Copy the application connection string.
6. Replace placeholders in the URI:

```text
mongodb+srv://USERNAME:PASSWORD@CLUSTER_HOST/pulse-talent?retryWrites=true&w=majority
```

## 2. Deploy Backend on Render

Create a new Render Web Service from the GitHub repository.

Settings:

```text
Root Directory: backend
Runtime: Node
Build Command: npm install
Start Command: npm start
```

Environment variables:

```text
MONGODB_URI=<your MongoDB Atlas connection string>
PORT=5000
NODE_ENV=production
JWT_SECRET=<long random secret>
JWT_EXPIRE=7d
MAX_FILE_SIZE=500000000
UPLOAD_DIR=./uploads
ENABLE_SENSITIVITY_ANALYSIS=true
SENSITIVITY_API_URL=mock
SENSITIVITY_API_KEY=test_key
CORS_ORIGIN=https://your-frontend-domain.vercel.app
SOCKET_IO_CORS=https://your-frontend-domain.vercel.app
```

After deployment, test:

```text
https://your-backend.onrender.com/api/health
```

Expected response:

```json
{
  "success": true,
  "message": "Server is running"
}
```

## 3. Deploy Frontend on Vercel

Create a new Vercel project from the same GitHub repository.

Settings:

```text
Root Directory: frontend
Framework Preset: Vite
Build Command: npm run build
Output Directory: dist
```

Environment variables:

```text
VITE_API_BASE_URL=https://your-backend.onrender.com/api
```

Redeploy after adding the environment variable.

## 4. Update Backend CORS

After Vercel gives you the frontend URL, update the backend environment variables on Render:

```text
CORS_ORIGIN=https://your-frontend-domain.vercel.app
SOCKET_IO_CORS=https://your-frontend-domain.vercel.app
```

If you need local and deployed frontend access at the same time:

```text
CORS_ORIGIN=http://localhost:5173,https://your-frontend-domain.vercel.app
SOCKET_IO_CORS=http://localhost:5173,https://your-frontend-domain.vercel.app
```

Then redeploy the backend.

## 5. Smoke Test

Run this full workflow:

1. Register user 1.
2. Upload a small MP4 video.
3. Confirm progress moves to completed.
4. Play the video.
5. Logout.
6. Register or login as user 2.
7. Confirm user 2 cannot see user 1 videos.
8. Upload and delete a video.
9. Confirm dashboard total videos updates correctly.

## Important Production Note

The current backend stores uploaded videos on the server filesystem. This is fine for local testing and assignment demos, but many cloud hosts use ephemeral storage. For a durable production deployment, replace local storage with AWS S3, Google Cloud Storage, Cloudinary, or another persistent object store.

