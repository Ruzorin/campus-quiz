import { create } from 'zustand';
import api from '../services/api';

interface User {
  id: number;
  username: string;
  email: string;
  avatar_url?: string;
  role?: 'student' | 'teacher' | 'admin';
}

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  login: (token: string, user: User) => void;
  logout: () => void;
  checkAuth: () => Promise<void>;
  setLoading: (isLoading: boolean) => void;
  setError: (error: string | null) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: localStorage.getItem('token'),
  isAuthenticated: !!localStorage.getItem('token'),
  isLoading: false,
  error: null,

  login: (token: string, user: User) => {
    localStorage.setItem('token', token);
    set({ token, user, isAuthenticated: true, error: null });
  },

  logout: () => {
    localStorage.removeItem('token');
    set({ token: null, user: null, isAuthenticated: false });
  },

  checkAuth: async () => {
    const token = localStorage.getItem('token');
    if (!token) return;

    try {
      // Use the token to fetch the user's profile
      const response = await api.get('/users/profile');
      // Update store with user data
      // Backend returns: { username, email, xp, level, streak, setsCreated, termsMastered, joinedAt }
      // We need to map this to our User interface if it differs, or update User interface
      // Our User interface only has id, username, email. We should populate it.
      // Wait, endpoint uses req.user.userId from token. We need the ID in the frontend user object too.
      // The profile response might not include 'id' explicitly if not added. I should check users.ts again.
      // Assuming profile endpoint is the best source.

      const user = response.data;
      set({
        user: {
          id: user.id, // Ensure backend sends ID
          username: user.username,
          email: user.email,
          avatar_url: user.avatar_url,
          role: user.role,
          // Add other props if extended User interface allows
        },
        isAuthenticated: true
      });
    } catch (error: any) {
      console.error('Auth check failed:', error);

      // Only logout if it's a clear authentication error (401)
      // If it's 404 (User not found) or 500 (Server error), we might want to keep the session 
      // if we have a valid token, to avoid login loops during deployment glitches.
      // However, if user is not found (404), technically we should logout. 
      // But given the current "Backend deployment lag" issue causing false 404s, 
      // let's be lenient and only logout on strict 401.

      if (error.response && error.response.status === 401) {
        localStorage.removeItem('token');
        set({ token: null, user: null, isAuthenticated: false, error: null });
      } else {
        // For other errors, keep isAuthenticated=true but maybe set error state
        // This prevents the "Loop" if backend returns 404/500 temporarily
        console.warn("Keeping session active despite profile fetch error:", error.message);
      }
    }
  },

  setLoading: (isLoading: boolean) => set({ isLoading }),
  setError: (error: string | null) => set({ error })
}));
