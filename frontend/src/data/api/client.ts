import axios from 'axios';
import { config } from '../../shared/config';

export const apiClient = axios.create({
  baseURL: config.apiUrl,
  withCredentials: true, // Crucial to send HttpOnly cookies with request headers
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request Interceptor: Attach bearer token if present in local memory
apiClient.interceptors.request.use(
  (reqConfig) => {
    const token = localStorage.getItem('auth_token');
    if (token && reqConfig.headers) {
      reqConfig.headers.Authorization = `Bearer ${token}`;
    }
    return reqConfig;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor: Automatically refresh sessions on 401 expiry and queue retries
let isRefreshing = false;
let failedQueue: Array<{
  resolve: (value: unknown) => void;
  reject: (error: unknown) => void;
}> = [];

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (token) {
      prom.resolve(token);
    } else {
      prom.reject(error);
    }
  });
  failedQueue = [];
};

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Check if error is 401 and request has not already been retried
    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({
            resolve: (token) => {
              originalRequest.headers.Authorization = `Bearer ${token}`;
              resolve(apiClient(originalRequest));
            },
            reject: (err) => {
              reject(err);
            },
          });
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        // Post request to refresh endpoint (will read from HttpOnly cookies on backend)
        const response = await axios.post(
          `${config.apiUrl}/api/auth/refresh`,
          {},
          { withCredentials: true }
        );

        const { accessToken } = response.data.data;
        localStorage.setItem('auth_token', accessToken);

        // Update headers
        apiClient.defaults.headers.common.Authorization = `Bearer ${accessToken}`;
        originalRequest.headers.Authorization = `Bearer ${accessToken}`;

        processQueue(null, accessToken);
        return apiClient(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError, null);
        // Clear local credentials on hard refresh failure
        localStorage.removeItem('auth_token');
        
        // Prevent infinite page reload loops by only redirecting if not already on authentication pages
        if (!window.location.pathname.startsWith('/login') && !window.location.pathname.startsWith('/register')) {
          window.location.href = '/login?error=session_expired';
        }
        
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);
