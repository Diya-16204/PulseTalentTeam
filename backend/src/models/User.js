/**
 * User Model
 * Defines the schema for user documents in MongoDB
 * Includes authentication credentials, roles, and timestamps
 */

import mongoose from 'mongoose';
import bcryptjs from 'bcryptjs';

// Define User schema
const userSchema = new mongoose.Schema(
  {
    // Personal Information
    firstName: {
      type: String,
      required: [true, 'Please provide a first name'],
      trim: true,
      minlength: [2, 'First name must be at least 2 characters']
    },
    lastName: {
      type: String,
      required: [true, 'Please provide a last name'],
      trim: true,
      minlength: [2, 'Last name must be at least 2 characters']
    },
    email: {
      type: String,
      required: [true, 'Please provide an email address'],
      unique: true,
      lowercase: true,
      match: [
        /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
        'Please provide a valid email address'
      ]
    },

    // Authentication
    password: {
      type: String,
      required: [true, 'Please provide a password'],
      minlength: [6, 'Password must be at least 6 characters'],
      select: false // Don't return password by default in queries
    },

    // Role-Based Access Control (RBAC)
    role: {
      type: String,
      enum: {
        values: ['viewer', 'editor', 'admin'],
        message: 'Role must be either viewer, editor, or admin'
      },
      default: 'viewer',
      lowercase: true
    },

    // Organization/Tenant Information (for multi-tenancy)
    organization: {
      type: String,
      default: 'personal',
      trim: true
    },

    // Account Status
    isActive: {
      type: Boolean,
      default: true
    },

    // Profile Picture
    profilePicture: {
      type: String,
      default: null
    },

    // Metadata
    lastLogin: Date,
    loginCount: {
      type: Number,
      default: 0
    }
  },
  {
    timestamps: true // Adds createdAt and updatedAt automatically
  }
);

/**
 * Middleware: Hash password before saving
 * Only hashes if password field was modified
 */
userSchema.pre('save', async function(next) {
  // Skip if password hasn't been modified
  if (!this.isModified('password')) {
    next();
    return;
  }

  try {
    // Generate salt and hash password
    const salt = await bcryptjs.genSalt(10);
    this.password = await bcryptjs.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

/**
 * Instance Method: Compare password
 * Used during login to verify user's password
 * 
 * @param {string} enteredPassword - The password entered by user
 * @returns {Promise<boolean>} - True if passwords match, false otherwise
 */
userSchema.methods.comparePassword = async function(enteredPassword) {
  return await bcryptjs.compare(enteredPassword, this.password);
};

/**
 * Instance Method: Get full name
 * Convenience method to get user's full name
 * 
 * @returns {string} - Full name of user
 */
userSchema.methods.getFullName = function() {
  return `${this.firstName} ${this.lastName}`;
};

/**
 * Virtuals: Define computed properties that don't get stored in database
 */
userSchema.virtual('videoCount').get(function() {
  return this._videoCount || 0;
});

// Ensure virtuals are included when converting to JSON
userSchema.set('toJSON', { virtuals: true });

const User = mongoose.model('User', userSchema);

export default User;
