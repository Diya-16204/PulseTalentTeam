/**
 * Dashboard Page Component
 * Main dashboard showing video library and statistics
 */

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { videoAPI } from '../services/api';
import VideoList from '../components/VideoList';
import DashboardStats from '../components/DashboardStats';
import '../styles/dashboard.css';

export default function DashboardPage() {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const [videos, setVideos] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({});

  // Redirect if not authenticated
  useEffect(() => {
    if (!isAuthenticated()) {
      navigate('/login');
    }
  }, [isAuthenticated, navigate]);

  // Fetch videos and stats
  useEffect(() => {
    fetchData();
  }, [filter, page]);

  const fetchData = async () => {
    try {
      setLoading(true);

      // Fetch videos
      const params = {
        page,
        limit: 10,
        status: filter === 'all' ? undefined : filter
      };

      const videosResponse = await videoAPI.getVideos(params);
      setVideos(videosResponse.data.data);
      setPagination(videosResponse.data.pagination);

      // Fetch stats
      const statsResponse = await videoAPI.getDashboardStats();
      setStats(statsResponse.data.data);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (videoId) => {
    if (window.confirm('Are you sure you want to delete this video?')) {
      try {
        await videoAPI.deleteVideo(videoId);
        fetchData(); // Refresh list
      } catch (error) {
        console.error('Error deleting video:', error);
      }
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
  };

  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <div className="header-content">
          <div className="user-summary">
            <h1>Welcome, {user?.firstName}!</h1>
            <p>
              {user?.email} · Role: {user?.role}
            </p>
          </div>
          <div className="header-actions">
            <button
              className="btn btn-primary"
              onClick={() => navigate('/upload')}
            >
              + Upload Video
            </button>
            <button
              className="btn btn-secondary logout-button"
              onClick={handleLogout}
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      {stats && <DashboardStats stats={stats} />}

      <div className="dashboard-content">
        <div className="filter-bar">
          <h2>Your Videos</h2>
          <div className="filter-controls">
            <select
              value={filter}
              onChange={(e) => {
                setFilter(e.target.value);
                setPage(1);
              }}
              className="filter-select"
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="processing">Processing</option>
              <option value="completed">Completed</option>
              <option value="failed">Failed</option>
            </select>
          </div>
        </div>

        {loading ? (
          <div className="loading">Loading videos...</div>
        ) : videos.length === 0 ? (
          <div className="empty-state">
            <p>No videos found. Start by uploading a video!</p>
            <button
              className="btn btn-primary"
              onClick={() => navigate('/upload')}
            >
              Upload Your First Video
            </button>
          </div>
        ) : (
          <>
            <VideoList videos={videos} onDelete={handleDelete} />

            {pagination.pages > 1 && (
              <div className="pagination">
                <button
                  onClick={() => setPage(page - 1)}
                  disabled={page === 1}
                >
                  Previous
                </button>
                <span>
                  Page {page} of {pagination.pages}
                </span>
                <button
                  onClick={() => setPage(page + 1)}
                  disabled={page === pagination.pages}
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
