# User Manual

## Register and Login

1. Open the frontend URL.
2. Select `Register here`.
3. Enter first name, last name, email, password, and confirm password.
4. After registration, the app opens the dashboard.
5. Use `Logout` on the dashboard to switch users.

## Dashboard

The dashboard shows:

- Logged-in user email and role
- Upload button
- Logout button
- Total videos
- Safe videos
- Flagged videos
- Processing videos
- Total views
- Total storage size
- A private list of videos uploaded by the current user

Each user sees only their own videos unless sharing/public access is explicitly added.

## Upload a Video

1. Click `+ Upload Video`.
2. Select or drag a video file.
3. Enter a title.
4. Optionally enter a description.
5. Click `Upload Video`.
6. Wait for upload and sensitivity analysis processing.

Supported upload formats include MP4, MPEG, MOV, AVI, MKV, and WEBM. The current maximum file size is 500 MB.

## Sensitivity Processing

After upload, the app creates a processing job and simulates sensitivity analysis. Results are classified as:

- `safe`
- `flagged`
- `unknown` while processing

The current implementation uses mock analysis so no external AI API key is required.

## Play a Video

1. Open the dashboard.
2. Click `View` on a completed video.
3. Use the built-in video controls to play, pause, seek, mute, or fullscreen.

Only completed videos are streamable.

## Delete a Video

1. Open the dashboard.
2. Click `Delete` on a video.
3. Confirm the browser prompt.
4. The video is soft-deleted and removed from dashboard counts.

## User Isolation

To verify multi-user isolation:

1. Login as user 1 and upload a video.
2. Logout.
3. Login as user 2.
4. User 2 should not see user 1's video.
5. Direct access to user 1's private video URL should return an authorization error.

