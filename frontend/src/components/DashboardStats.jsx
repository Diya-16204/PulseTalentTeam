/**
 * Dashboard Stats Component
 * Displays key statistics about user's videos
 */

import React from 'react';
import '../styles/dashboardStats.css';

export default function DashboardStats({ stats }) {
  const formatBytes = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  const statCards = [
    {
      label: 'Total Videos',
      value: stats.totalVideos,
      icon: '📹',
      color: '#6366f1'
    },
    {
      label: 'Safe Videos',
      value: stats.safeVideos,
      icon: '✓',
      color: '#10b981'
    },
    {
      label: 'Flagged Videos',
      value: stats.flaggedVideos,
      icon: '⚠',
      color: '#f59e0b'
    },
    {
      label: 'Processing',
      value: stats.processingVideos,
      icon: '⏳',
      color: '#3b82f6'
    },
    {
      label: 'Total Views',
      value: stats.totalViews,
      icon: '👁',
      color: '#8b5cf6'
    },
    {
      label: 'Total Size',
      value: formatBytes(stats.totalSize),
      icon: '💾',
      color: '#ec4899'
    }
  ];

  return (
    <div className="dashboard-stats">
      <div className="stats-grid">
        {statCards.map((card, index) => (
          <div key={index} className="stat-card" style={{ borderTopColor: card.color }}>
            <div className="stat-icon">{card.icon}</div>
            <div className="stat-content">
              <p className="stat-label">{card.label}</p>
              <p className="stat-value">{card.value}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
