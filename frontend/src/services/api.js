/**
 * API Client Service
 * Handles all HTTP requests to the backend API
 */

import axios from 'axios';

export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';

// Create axios instance with default config
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Request interceptor to add JWT token
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid, clear and redirect to login
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

/**
 * Auth API Calls
 */
export const authAPI = {
  register: (data) => apiClient.post('/auth/register', data),
  login: (data) => apiClient.post('/auth/login', data),
  getProfile: () => apiClient.get('/auth/profile'),
  updateProfile: (data) => apiClient.put('/auth/profile', data),
  changePassword: (data) => apiClient.post('/auth/change-password', data),
  logout: () => apiClient.post('/auth/logout')
};

/**
 * Video API Calls
 */
export const videoAPI = {
  uploadVideo: (formData) => 
    apiClient.post('/videos/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    }),
  
  getVideos: (params) => 
    apiClient.get('/videos', { params }),
  
  getVideoDetails: (videoId) => 
    apiClient.get(`/videos/${videoId}`),
  
  updateVideo: (videoId, data) => 
    apiClient.put(`/videos/${videoId}`, data),
  
  deleteVideo: (videoId) => 
    apiClient.delete(`/videos/${videoId}`),
  
  shareVideo: (videoId, data) => 
    apiClient.post(`/videos/${videoId}/share`, data),
  
  revokeShare: (videoId, userId) => 
    apiClient.delete(`/videos/${videoId}/share/${userId}`),
  
  getProcessingStatus: (videoId) => 
    apiClient.get(`/videos/${videoId}/processing-status`),
  
  getSensitivityAnalysis: (videoId) => 
    apiClient.get(`/videos/${videoId}/analysis`),
  
  reanalyzeVideo: (videoId) => 
    apiClient.post(`/videos/${videoId}/reanalyze`),
  
  getDashboardStats: () => 
    apiClient.get('/videos/dashboard/stats'),
  
  getStreamUrl: (videoId) => {
    const token = localStorage.getItem('token');
    const tokenQuery = token ? `?token=${encodeURIComponent(token)}` : '';
    return `${API_BASE_URL}/videos/${videoId}/stream${tokenQuery}`;
  }
};

export default apiClient;
