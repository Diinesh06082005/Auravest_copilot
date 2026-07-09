import { create } from 'zustand';
import { apiClient } from '../../data/api/client';
import { config } from '../../shared/config';

interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: 'user' | 'analyst' | 'admin';
  avatar?: string;
}

interface AuthState {
  user: UserProfile | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  loginWithGoogle: () => void;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
  clearError: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,
  isLoading: true,
  error: null,

  login: async (email, password) => {
    set({ isLoading: true, error: null });
    try {
      const response = await apiClient.post('/api/auth/login', { email, password });
      const { user, accessToken } = response.data.data;
      
      localStorage.setItem('auth_token', accessToken);
      set({ 
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          avatar: user.avatar,
        },
        isAuthenticated: true,
        isLoading: false,
      });
    } catch (err: any) {
      const errMsg = err.response?.data?.message || err.message || 'Login failed. Please try again.';
      set({ error: errMsg, isLoading: false });
      throw err;
    }
  },

  register: async (name, email, password) => {
    set({ isLoading: true, error: null });
    try {
      const response = await apiClient.post('/api/auth/register', { name, email, password });
      const { user, accessToken } = response.data.data;
      
      localStorage.setItem('auth_token', accessToken);
      set({ 
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          avatar: user.avatar,
        },
        isAuthenticated: true,
        isLoading: false,
      });
    } catch (err: any) {
      const errMsg = err.response?.data?.message || err.message || 'Registration failed. Please try again.';
      set({ error: errMsg, isLoading: false });
      throw err;
    }
  },

  loginWithGoogle: () => {
    // Redirect browser directly to Google OAuth initialization endpoint
    window.location.href = `${config.apiUrl}/api/auth/google`;
  },

  logout: async () => {
    set({ isLoading: true });
    try {
      await apiClient.post('/api/auth/logout');
    } catch (err) {
      // Ignore failures on logout API call
    } finally {
      localStorage.removeItem('auth_token');
      set({ user: null, isAuthenticated: false, isLoading: false, error: null });
    }
  },

  checkAuth: async () => {
    set({ isLoading: true, error: null });
    
    // If there is no token in localStorage, we can still try to check auth
    // because cookies might be present. But if both are empty, we handle it.
    try {
      const response = await apiClient.get('/api/auth/me');
      const { user, accessToken } = response.data.data;
      
      if (accessToken) {
        localStorage.setItem('auth_token', accessToken);
        apiClient.defaults.headers.common.Authorization = `Bearer ${accessToken}`;
      }
      
      // If we don't have token in localStorage, but cookies worked, the backend 
      // check returned 200. We can obtain a new token by refreshing, or the backend 
      // could return it. For now, let's keep the user authenticated.
      set({ 
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          avatar: user.avatar,
        },
        isAuthenticated: true,
        isLoading: false,
      });
    } catch (err: any) {
      localStorage.removeItem('auth_token');
      set({ user: null, isAuthenticated: false, isLoading: false });
    }
  },

  clearError: () => set({ error: null }),
}));
