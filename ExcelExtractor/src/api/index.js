import axios from 'axios';

// Smart API URL detection for production and development
let API_URL = import.meta.env.VITE_API_URL;

if (!API_URL) {
  // In development: use localhost
  if (import.meta.env.DEV) {
    API_URL = 'http://localhost:5000';
  } else {
    // In production: use the current domain with /api route
    // If backend is on same server, just use /api
    // If backend is separate, the VITE_API_URL env var must be set
    const currentDomain = window.location.origin;
    
    // Check if we're on Railway or similar
    if (currentDomain.includes('.up.railway.app') || currentDomain.includes('railway')) {
      // On Railway: backend might be same domain or separate
      // Try to use same domain first
      API_URL = currentDomain; // Will be adjusted based on deployment
    } else {
      API_URL = currentDomain;
    }
  }
}

console.log('🔗 API URL:', API_URL);

const API = axios.create({
  baseURL: `${API_URL}/api`,
  withCredentials: true,
  timeout: 300000, // 5 minutes timeout for large file uploads
});

// Request interceptor to add auth token
API.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    // Log file uploads for debugging
    if (config.url?.includes('/convert/upload')) {
      console.log('📤 [API] Uploading file to:', config.url, 'Full URL:', `${API.defaults.baseURL}${config.url}`);
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle token expiry and log errors
API.interceptors.response.use(
  (response) => {
    if (response.config.url?.includes('/convert/upload')) {
      console.log('✅ [API] Upload successful');
    }
    return response;
  },
  (error) => {
    // Log detailed error information for debugging
    if (error.config?.url?.includes('/convert/upload')) {
      console.error('❌ [API] Upload failed:', {
        status: error.response?.status,
        statusText: error.response?.statusText,
        message: error.response?.data?.message || error.message,
        code: error.code,
        url: error.config?.url,
      });
    }
    
    if (error.response?.status === 401) {
      console.warn('⚠️ [API] 401 Unauthorized - clearing localStorage');
      // Token is invalid or expired
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth APIs
export const signup = (userData) => API.post('/auth/signup', userData);
export const login = (userData) => API.post('/auth/login', userData);
export const logout = () => API.post('/auth/logout');

// File conversion API
export const uploadFile = (formData, onProgress) => {
  return API.post('/convert/upload', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
    timeout: 600000, // 10 minutes for file uploads (extra long for large PDFs)
    onUploadProgress: (progressEvent) => {
      if (onProgress) {
        const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
        onProgress(percentCompleted);
      }
    },
  });
};

export default API;
