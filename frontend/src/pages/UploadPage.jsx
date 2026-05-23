/**
 * Upload Page Component
 * Video upload interface with drag-and-drop support
 */

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { API_BASE_URL } from '../services/api';
import '../styles/upload.css';

export default function UploadPage() {
  const navigate = useNavigate();
  const [file, setFile] = useState(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [uploadProgress, setUploadProgress] = useState(0);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
      setError('');
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.currentTarget.classList.add('dragover');
  };

  const handleDragLeave = (e) => {
    e.currentTarget.classList.remove('dragover');
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.currentTarget.classList.remove('dragover');
    const droppedFiles = e.dataTransfer.files;
    if (droppedFiles[0]) {
      setFile(droppedFiles[0]);
      setError('');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!file) {
      setError('Please select a video file');
      return;
    }

    if (!title.trim()) {
      setError('Please enter a video title');
      return;
    }

    setUploading(true);

    try {
      const formData = new FormData();
      formData.append('video', file);
      formData.append('title', title);
      formData.append('description', description);

      // Create a custom axios instance to track upload progress
      const xhr = new XMLHttpRequest();

      xhr.upload.addEventListener('progress', (e) => {
        if (e.lengthComputable) {
          const percentComplete = (e.loaded / e.total) * 100;
          setUploadProgress(percentComplete);
        }
      });

      xhr.addEventListener('load', async () => {
        if (xhr.status === 201) {
          const response = JSON.parse(xhr.responseText);
          navigate(`/video/${response.data._id}`);
          return;
        }

        let message = 'Upload failed';

        try {
          const response = JSON.parse(xhr.responseText);
          message = response.message || message;
        } catch {
          if (xhr.statusText) {
            message = xhr.statusText;
          }
        }

        setError(message);
        setUploading(false);
      });

      xhr.addEventListener('error', () => {
        setError('Upload failed. Please make sure the backend server is running.');
        setUploading(false);
      });

      // Get token and make request
      const token = localStorage.getItem('token');
      xhr.open('POST', `${API_BASE_URL}/videos/upload`);
      xhr.setRequestHeader('Authorization', `Bearer ${token}`);
      xhr.send(formData);
    } catch (err) {
      setError(err.response?.data?.message || 'Upload failed');
      setUploading(false);
    }
  };

  return (
    <div className="upload-container">
      <div className="upload-card">
        <h1>Upload Video</h1>
        <p className="subtitle">Upload and analyze your videos for content sensitivity</p>

        <form onSubmit={handleSubmit} className="upload-form">
          {error && <div className="error-message">{error}</div>}

          <div
            className="file-drop-zone"
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            <div className="drop-zone-content">
              <svg className="upload-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 4v16m8-8H4"
                />
              </svg>
              <p className="drop-zone-text">
                Drag and drop your video here, or click to select
              </p>
              <input
                type="file"
                accept="video/*"
                onChange={handleFileChange}
                disabled={uploading}
                style={{ display: 'none' }}
                id="file-input"
              />
              <label htmlFor="file-input" className="btn btn-secondary">
                Select File
              </label>
            </div>
          </div>

          {file && (
            <div className="file-info">
              <p>
                <strong>Selected:</strong> {file.name}
              </p>
              <p>
                <strong>Size:</strong>{' '}
                {(file.size / (1024 * 1024)).toFixed(2)} MB
              </p>
            </div>
          )}

          <div className="form-group">
            <label htmlFor="title">Video Title *</label>
            <input
              type="text"
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter video title"
              required
              maxLength={100}
            />
          </div>

          <div className="form-group">
            <label htmlFor="description">Description</label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Enter video description (optional)"
              maxLength={500}
              rows={4}
            />
          </div>

          {uploading && (
            <div className="upload-progress">
              <div className="progress-bar">
                <div
                  className="progress-fill"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
              <p>{Math.round(uploadProgress)}% uploaded</p>
            </div>
          )}

          <button
            type="submit"
            className="btn btn-primary btn-full"
            disabled={uploading || !file}
          >
            {uploading ? 'Uploading...' : 'Upload Video'}
          </button>
        </form>
      </div>
    </div>
  );
}
