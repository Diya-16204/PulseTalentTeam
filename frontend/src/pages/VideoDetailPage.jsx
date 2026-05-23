/**
 * Video Detail Component
 * Shows video information and streaming interface
 */

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { videoAPI } from '../services/api';
import '../styles/videoDetail.css';

export default function VideoDetail() {
  const { videoId } = useParams();
  const navigate = useNavigate();
  const [video, setVideo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [processing, setProcessing] = useState(null);

  useEffect(() => {
    fetchVideo();
    // Poll for processing updates
    const interval = setInterval(() => {
      if (video?.processingStatus === 'processing' || video?.processingStatus === 'pending') {
        fetchProcessingStatus();
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [videoId, video?.processingStatus]);

  const fetchVideo = async () => {
    try {
      const response = await videoAPI.getVideoDetails(videoId);
      setVideo(response.data.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load video');
    } finally {
      setLoading(false);
    }
  };

  const fetchProcessingStatus = async () => {
    try {
      const response = await videoAPI.getProcessingStatus(videoId);
      setProcessing(response.data.data);
    } catch (err) {
      console.error('Error fetching processing status:', err);
    }
  };

  if (loading) {
    return <div className="loading">Loading video...</div>;
  }

  if (error) {
    return (
      <div className="error-container">
        <p className="error-message">{error}</p>
        <button className="btn btn-primary" onClick={() => navigate('/dashboard')}>
          Back to Dashboard
        </button>
      </div>
    );
  }

  return (
    <div className="video-detail">
      <button className="btn btn-secondary" onClick={() => navigate('/dashboard')}>
        ← Back
      </button>

      <div className="detail-container">
        <div className="video-player">
          {video?.isStreamable && video?.processingStatus === 'completed' ? (
            <video
              controls
              width="100%"
              src={videoAPI.getStreamUrl(videoId)}
              className="video-element"
            />
          ) : (
            <div className="player-placeholder">
              <p>
                {video?.processingStatus === 'pending' && 'Video is pending processing...'}
                {video?.processingStatus === 'processing' && 'Video is being processed...'}
                {video?.processingStatus === 'failed' && 'Video processing failed'}
              </p>
              {(video?.processingStatus === 'pending' || video?.processingStatus === 'processing') && (
                <div className="progress-bar">
                  <div
                    className="progress-fill"
                    style={{ width: `${video?.processingProgress || processing?.progress}%` }}
                  />
                </div>
              )}
              <p className="progress-text">
                {video?.processingProgress || processing?.progress}% complete
              </p>
            </div>
          )}
        </div>

        <div className="video-sidebar">
          <h1>{video?.title}</h1>
          {video?.description && <p className="description">{video.description}</p>}

          <div className="info-section">
            <h3>Video Information</h3>
            <div className="info-item">
              <span className="label">Status:</span>
              <span className="value">{video?.processingStatus}</span>
            </div>
            <div className="info-item">
              <span className="label">Safety Status:</span>
              <span className={`value safety-${video?.sensitivityAnalysis.status}`}>
                {video?.sensitivityAnalysis.status}
              </span>
            </div>
            <div className="info-item">
              <span className="label">File Size:</span>
              <span className="value">
                {(video?.fileSize / (1024 * 1024)).toFixed(2)} MB
              </span>
            </div>
            <div className="info-item">
              <span className="label">Views:</span>
              <span className="value">{video?.viewCount}</span>
            </div>
            <div className="info-item">
              <span className="label">Uploaded:</span>
              <span className="value">
                {new Date(video?.createdAt).toLocaleDateString()}
              </span>
            </div>
          </div>

          {video?.sensitivityAnalysis.status !== 'unknown' && (
            <div className="info-section">
              <h3>Sensitivity Analysis</h3>
              <div className="info-item">
                <span className="label">Confidence:</span>
                <span className="value">{video?.sensitivityAnalysis.confidence}%</span>
              </div>
              {video?.sensitivityAnalysis.flags?.length > 0 && (
                <div className="info-item">
                  <span className="label">Flags:</span>
                  <div className="flags">
                    {video?.sensitivityAnalysis.flags.map((flag, i) => (
                      <span key={i} className="flag-tag">
                        {flag}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              {video?.sensitivityAnalysis.analysisDetails && (
                <div className="info-item">
                  <span className="label">Details:</span>
                  <p className="details-text">
                    {video?.sensitivityAnalysis.analysisDetails}
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
