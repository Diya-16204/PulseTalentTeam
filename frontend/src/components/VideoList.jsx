/**
 * Video List Component
 * Displays a grid of videos with status badges
 */

import React from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/videoList.css';

const getStatusBadge = (status) => {
  const statusConfig = {
    pending: { class: 'status-pending', label: 'Pending' },
    processing: { class: 'status-processing', label: 'Processing' },
    completed: { class: 'status-completed', label: 'Completed' },
    failed: { class: 'status-failed', label: 'Failed' }
  };

  const config = statusConfig[status] || { class: 'status-unknown', label: 'Unknown' };
  return <span className={`status-badge ${config.class}`}>{config.label}</span>;
};

const getSafetyBadge = (status) => {
  const safetyConfig = {
    safe: { class: 'safety-safe', label: '✓ Safe' },
    flagged: { class: 'safety-flagged', label: '⚠ Flagged' },
    unknown: { class: 'safety-unknown', label: '? Analyzing' }
  };

  const config = safetyConfig[status] || { class: 'safety-unknown', label: 'Unknown' };
  return <span className={`safety-badge ${config.class}`}>{config.label}</span>;
};

export default function VideoList({ videos, onDelete }) {
  const navigate = useNavigate();

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString();
  };

  return (
    <div className="video-list">
      <div className="video-grid">
        {videos.map((video) => (
          <div key={video._id} className="video-card">
            <div className="video-header">
              <h3>{video.title}</h3>
              <div className="status-badges">
                {getStatusBadge(video.processingStatus)}
                {getSafetyBadge(video.sensitivityAnalysis.status)}
              </div>
            </div>

            {video.description && (
              <p className="video-description">{video.description}</p>
            )}

            <div className="video-meta">
              <div className="meta-item">
                <span className="meta-label">Size:</span>
                <span>{formatFileSize(video.fileSize)}</span>
              </div>
              <div className="meta-item">
                <span className="meta-label">Uploaded:</span>
                <span>{formatDate(video.createdAt)}</span>
              </div>
              <div className="meta-item">
                <span className="meta-label">Views:</span>
                <span>{video.viewCount}</span>
              </div>
            </div>

            {video.processingStatus === 'processing' && (
              <div className="progress-bar">
                <div
                  className="progress-fill"
                  style={{ width: `${video.processingProgress}%` }}
                />
              </div>
            )}

            <div className="video-actions">
              <button
                className="btn btn-small btn-primary"
                onClick={() => navigate(`/video/${video._id}`)}
              >
                View
              </button>
              <button
                className="btn btn-small btn-secondary"
                onClick={() => navigate(`/video/${video._id}/edit`)}
              >
                Edit
              </button>
              <button
                className="btn btn-small btn-danger"
                onClick={() => onDelete(video._id)}
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
