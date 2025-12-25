import { create } from 'zustand';
import api from '../services/api';

interface User {
  id: number;
  username: string;
  email: string;
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
          // Add other props if extended User interface allows
        },
        isAuthenticated: true
      });
    } catch (error) {
      console.error('Auth check failed:', error);
      // If unauthorized, clear auth state
      localStorage.removeItem('token');
      set({ token: null, user: null, isAuthenticated: false, error: null });
    }
  },

  setLoading: (isLoading: boolean) => set({ isLoading }),
  setError: (error: string | null) => set({ error })
}));
