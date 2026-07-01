import axios from 'axios';
import useAuthStore from '../store/authStore';

const axiosClient = axios.create({
    baseURL: '/api/v1',
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
    },
    // Wajib diaktifkan jika menggunakan Laravel Sanctum untuk autentikasi nanti
    withCredentials: true,
});

/**
 * Request interceptor — attaches Bearer token from Zustand auth store.
 *
 * ⚠ This is a plain JS file, NOT a React component.
 *   We use useAuthStore.getState() (direct state access)
 *   instead of useAuthStore() (React hook) to avoid hook-rule violations.
 */
axiosClient.interceptors.request.use(
    (config) => {
        const token = useAuthStore.getState().token;
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error),
);

/* ──────────────────────────────────────────────
   Global toast event system
   ──────────────────────────────────────────────
   Allows any component to subscribe to global error toasts.
   Usage:
     import { toastEvents } from '../api/axiosClient';
     useEffect(() => toastEvents.subscribe(handler), []);
   ────────────────────────────────────────────── */
const listeners = new Set();

export const toastEvents = {
    subscribe: (fn) => {
        listeners.add(fn);
        return () => listeners.delete(fn);
    },
    emit: (toast) => {
        listeners.forEach((fn) => fn(toast));
    },
};

/**
 * Response interceptor — handles global error scenarios:
 * - 401: Token expired or invalid → auto-logout + redirect.
 * - 500+: Server error → global toast.
 * - Network/CORS: No response received → global toast.
 *
 * Individual store/component catch blocks still receive the error
 * for local handling (e.g. form validation messages).
 */
axiosClient.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response) {
            const { status } = error.response;

            if (status === 401) {
                // Only auto-logout if the user was previously authenticated
                const token = useAuthStore.getState().token;
                if (token) {
                    useAuthStore.getState().clearAuth();
                    toastEvents.emit({
                        type: 'error',
                        title: 'Sesi Berakhir',
                        message: 'Silakan login kembali.',
                    });
                    // Redirect to login (works outside React Router)
                    window.location.href = '/login';
                }
            } else if (status >= 500) {
                toastEvents.emit({
                    type: 'error',
                    title: 'Kesalahan Server',
                    message: `Server mengembalikan status ${status}. Silakan coba beberapa saat lagi.`,
                });
            }
        } else if (error.request) {
            // Network error or CORS block — no response was received
            toastEvents.emit({
                type: 'error',
                title: 'Koneksi Gagal',
                message: 'Tidak dapat terhubung ke server. Periksa koneksi internet atau konfigurasi CORS.',
            });
        }

        return Promise.reject(error);
    },
);

export default axiosClient;