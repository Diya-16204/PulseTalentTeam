/**
 * Role-Based Access Control (RBAC) Middleware
 * Restricts access to routes based on user roles
 * Implements permission checking for different user types
 */

/**
 * Middleware: Authorize by Roles
 * Creates middleware to check if user has required role
 * 
 * Usage: app.delete('/video/:id', authorize('admin', 'editor'), deleteVideo)
 * 
 * @param {...string} allowedRoles - Roles that are allowed access
 * @returns {function} - Express middleware function
 */
const authorize = (...allowedRoles) => {
  return (req, res, next) => {
    // Check if user exists (should be set by protect middleware)
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'User not authenticated'
      });
    }

    // Check if user's role is in allowed roles
    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `User role '${req.user.role}' does not have permission to access this resource. Required roles: ${allowedRoles.join(', ')}`
      });
    }

    next();
  };
};

/**
 * Middleware: Check Video Ownership or Share Permission
 * Verifies user owns or has access to a video
 * Implements multi-tenancy and sharing permissions
 * 
 * @param {object} req - Express request object
 * @param {object} res - Express response object
 * @param {function} next - Express next middleware function
 */
const checkVideoAccess = async (req, res, next) => {
  try {
    const Video = (await import('../models/Video.js')).default;
    const video = await Video.findById(req.params.videoId);

    if (!video) {
      return res.status(404).json({
        success: false,
        message: 'Video not found'
      });
    }

    // Admin can access any video
    if (req.user.role === 'admin') {
      req.video = video;
      return next();
    }

    // Check if user is the owner
    if (video.uploadedBy.toString() === req.user._id.toString()) {
      req.video = video;
      return next();
    }

    // Check if video is shared with user
    const isShared = video.sharedWith.some(share => 
      share.userId.toString() === req.user._id.toString()
    );

    if (isShared) {
      req.video = video;
      req.videoAccessRole = video.sharedWith.find(
        share => share.userId.toString() === req.user._id.toString()
      ).role;
      return next();
    }

    // Check if video is public
    if (video.isPublic) {
      req.video = video;
      req.videoAccessRole = 'viewer'; // Public videos are view-only
      return next();
    }

    // User doesn't have access
    return res.status(403).json({
      success: false,
      message: 'You do not have permission to access this video'
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Middleware: Verify Video Edit Permission
 * Used with checkVideoAccess to ensure user can edit
 * 
 * @param {object} req - Express request object
 * @param {object} res - Express response object
 * @param {function} next - Express next middleware function
 */
const checkVideoEditAccess = (req, res, next) => {
  // User must be owner or admin to edit
  if (req.user.role === 'admin') {
    return next();
  }

  if (req.video.uploadedBy.toString() === req.user._id.toString()) {
    return next();
  }

  // Check if shared with edit permission
  if (req.videoAccessRole === 'editor') {
    return next();
  }

  return res.status(403).json({
    success: false,
    message: 'You do not have permission to edit this video'
  });
};

/**
 * Permission Matrix for Different Roles
 * 
 * VIEWER:
 * - Read own videos
 * - Read shared videos (viewer role)
 * - View public videos
 * - Stream videos
 * 
 * EDITOR:
 * - All VIEWER permissions
 * - Upload videos
 * - Edit own videos
 * - Delete own videos
 * - Share videos with other users
 * 
 * ADMIN:
 * - All permissions
 * - Access all videos
 * - Manage users
 * - System settings
 * - View analytics
 */

export { authorize, checkVideoAccess, checkVideoEditAccess };
