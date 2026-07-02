import { create } from 'zustand';
import axios from 'axios';
import axiosClient from '../api/axiosClient';

/**
 * Auth Store — Manages user session and bearer token.
 *
 * Token is persisted to localStorage so the Axios interceptor
 * (a plain JS file) can read it on page reload via getState().
 *
 * Usage in React components:  const { user, token } = useAuthStore();
 * Usage in plain JS files:    useAuthStore.getState().token
 */
const useAuthStore = create((set, get) => ({
  // ── State ──
  user: JSON.parse(localStorage.getItem('user')) || null,
  token: localStorage.getItem('token') || null,
  isLoading: false,
  error: null,

  // ── Actions ──

  /**
   * Called after a successful login/register response.
   * Persists token + user to localStorage for session survival.
   */
  setAuth: (user, token) => {
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(user));
    set({ user, token, error: null });
  },

  /**
   * Clears session — logout or token expiry.
   */
  clearAuth: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    set({ user: null, token: null, error: null });
  },

  /**
   * Generic loading/error helpers for login/register flows.
   */
  setLoading: (isLoading) => set({ isLoading }),
  setError: (error) => set({ error, isLoading: false }),

  /**
   * Login — POST /login with email & password.
   * On success: persists user + token, returns true.
   * On failure: sets a human-readable error message, returns false.
   */
  login: async (email, password) => {
    set({ isLoading: true, error: null });
    try {
      // Sanctum CSRF handshake — must precede every stateful auth request
      await axios.get('/sanctum/csrf-cookie');
      const { data } = await axiosClient.post('/login', { email, password });
      // Laravel Sanctum typically returns { user, token } or { data: { user, token } }
      const user = data.user ?? data.data?.user;
      const token = data.token ?? data.data?.token;
      get().setAuth(user, token);
      set({ isLoading: false });
      return true;
    } catch (err) {
      let message = 'Terjadi kesalahan. Silakan coba lagi.';

      if (err.response) {
        const status = err.response.status;
        if (status === 401) {
          message = 'Email atau kata sandi salah.';
        } else if (status === 422) {
          // Validation errors from Laravel
          const errors = err.response.data?.errors;
          if (errors) {
            message = Object.values(errors).flat().join(' ');
          } else {
            message = err.response.data?.message || 'Data yang dikirim tidak valid.';
          }
        } else if (status >= 500) {
          message = 'Server sedang bermasalah. Silakan coba beberapa saat lagi.';
        }
      } else if (err.request) {
        // Network error / CORS blocked — no response received
        message = 'Tidak dapat terhubung ke server. Periksa koneksi atau konfigurasi CORS.';
      }

      set({ error: message, isLoading: false });
      return false;
    }
  },

  /**
   * Register — POST /register with name, email, password, password_confirmation.
   * On success: persists user + token, returns true.
   * On failure: sets a human-readable error message, returns false.
   */
  register: async (name, email, password, passwordConfirmation) => {
    set({ isLoading: true, error: null });
    try {
      // Sanctum CSRF handshake — must precede every stateful auth request
      await axios.get('/sanctum/csrf-cookie');
      const { data } = await axiosClient.post('/register', {
        name,
        email,
        password,
        password_confirmation: passwordConfirmation,
        role: 'user', // Silently injected default role
      });
      const user = data.user ?? data.data?.user;
      const token = data.token ?? data.data?.token;
      get().setAuth(user, token);
      set({ isLoading: false });
      return true;
    } catch (err) {
      let message = 'Terjadi kesalahan. Silakan coba lagi.';

      if (err.response) {
        const status = err.response.status;
        if (status === 422) {
          const errors = err.response.data?.errors;
          if (errors) {
            message = Object.values(errors).flat().join(' ');
          } else {
            message = err.response.data?.message || 'Data yang dikirim tidak valid.';
          }
        } else if (status >= 500) {
          message = 'Server sedang bermasalah. Silakan coba beberapa saat lagi.';
        }
      } else if (err.request) {
        message = 'Tidak dapat terhubung ke server. Periksa koneksi atau konfigurasi CORS.';
      }

      set({ error: message, isLoading: false });
      return false;
    }
  },
}));

export default useAuthStore;
