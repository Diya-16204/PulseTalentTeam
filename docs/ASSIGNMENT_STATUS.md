# Assignment Completion Status

## Completed

- Full-stack architecture with Node.js, Express, MongoDB, React, and Vite
- JWT authentication
- Password hashing
- Protected routes
- Multi-user login/logout flow
- User-isolated video listing
- Video upload with Multer
- File type and size validation
- Video metadata stored in MongoDB
- Mock sensitivity analysis pipeline
- Processing jobs in MongoDB
- Real-time processing event infrastructure with Socket.io
- Dashboard stats
- Soft delete for videos
- Dashboard counts excluding deleted videos
- HTTP range request video streaming
- Stream authorization for browser video playback
- Frontend upload progress
- Dashboard filtering by processing status
- User manual
- API/setup/architecture documentation
- Deployment guide

## Partially Implemented

- RBAC exists at backend middleware level with `viewer`, `editor`, and `admin` roles.
- Self-registered users can upload for demo usability.
- Admin user-management screens are not implemented.
- Sensitivity analysis is mocked rather than using a real ML/API service.
- FFmpeg is listed as optional future processing but is not required by current code.
- Local file storage is implemented; durable production object storage is not implemented.

## Recommended Before Final Submission

1. Record a 2-4 minute demo video showing:
   - Register/login
   - Upload
   - Processing result
   - Playback
   - Delete and corrected dashboard stats
   - Logout/login as second user
2. Deploy backend and frontend publicly.
3. Add deployed URLs to `README.md`.
4. Add screenshots or a short GIF to the README.
5. Push final code to GitHub with a clean commit message.

## Assumptions and Design Decisions

- The assignment accepts mock sensitivity analysis for demonstration.
- Each uploaded video belongs to one user and is isolated by `uploadedBy`.
- Soft delete is used so records remain auditable.
- The browser video player uses a token query parameter for stream requests because native video elements cannot send custom authorization headers.
- For production durability, video files should move from local disk to object storage.

