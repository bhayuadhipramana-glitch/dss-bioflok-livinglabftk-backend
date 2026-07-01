import { create } from 'zustand';
import { sensorService } from '../api/sensorService';
import axiosClient from '../api/axiosClient';

/**
 * Sensor Store — Manages water quality readings from the API.
 *
 * Calls sensorService methods (which use axiosClient)
 * to keep the service layer intact as a standalone module.
 *
 * IMPORTANT: Every mutating action (add/update/delete) hits the
 * backend FIRST, and only updates local state after a 200/201 response.
 */
const useSensorStore = create((set, get) => ({
  // ── State ──
  readings: [],
  isLoading: false,
  error: null,

  // ── Actions ──

  /**
   * Fetches sensor readings from GET /sensor-readings.
   * The API returns { status: 'success', data: [...] } with newest first.
   * We reverse to chronological order so Recharts plots left-to-right in time.
   */
  fetchReadings: async () => {
    set({ isLoading: true, error: null });

    try {
      const response = await sensorService.getAllReadings();

      // API response shape: { status: 'success', data: [...] }
      const rawData = response.data || [];

      // Reverse from newest-first → oldest-first (chronological for charts)
      const chronological = [...rawData].reverse();

      set({ readings: chronological, isLoading: false });
    } catch (err) {
      const message =
        err.response?.data?.message ||
        err.message ||
        'Gagal memuat data sensor. Periksa koneksi ke server.';

      set({ error: message, isLoading: false });
    }
  },

  /**
   * Adds a new sensor reading — POSTs to the backend FIRST,
   * then prepends the returned record to local state.
   * Returns the new record on success, null on failure.
   */
  addReading: async (payload) => {
    set({ isLoading: true, error: null });

    try {
      const { data } = await axiosClient.post('/sensor-readings', payload);
      // Laravel returns { status: 'success', data: { ...newRecord } }
      const newRecord = data.data;

      // Append to end (chronological order — newest at end)
      set((state) => ({
        readings: [...state.readings, newRecord],
        isLoading: false,
      }));

      return newRecord;
    } catch (err) {
      let message = 'Gagal menyimpan data sensor.';

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
      return null;
    }
  },

  /**
   * Updates an existing sensor reading — PUTs to the backend FIRST,
   * then patches the record in local state.
   * Returns the updated record on success, null on failure.
   */
  updateReading: async (id, payload) => {
    set({ isLoading: true, error: null });

    try {
      const response = await sensorService.updateReading(id, payload);
      const updated = response.data;

      set((state) => ({
        readings: state.readings.map((r) =>
          r.id === id ? { ...r, ...updated } : r
        ),
        isLoading: false,
      }));

      return updated;
    } catch (err) {
      let message = 'Gagal memperbarui data sensor.';

      if (err.response) {
        const status = err.response.status;
        if (status === 422) {
          const errors = err.response.data?.errors;
          message = errors
            ? Object.values(errors).flat().join(' ')
            : err.response.data?.message || 'Data tidak valid.';
        } else if (status === 404) {
          message = 'Data tidak ditemukan. Mungkin sudah dihapus.';
        } else if (status >= 500) {
          message = 'Server sedang bermasalah.';
        }
      } else if (err.request) {
        message = 'Tidak dapat terhubung ke server.';
      }

      set({ error: message, isLoading: false });
      return null;
    }
  },

  /**
   * Deletes a sensor reading — DELETEs from the backend FIRST,
   * then removes it from local state.
   * Returns true on success, false on failure.
   */
  deleteReading: async (id) => {
    set({ isLoading: true, error: null });

    try {
      await sensorService.deleteReading(id);

      set((state) => ({
        readings: state.readings.filter((r) => r.id !== id),
        isLoading: false,
      }));

      return true;
    } catch (err) {
      let message = 'Gagal menghapus data sensor.';

      if (err.response?.status === 404) {
        message = 'Data tidak ditemukan. Mungkin sudah dihapus.';
      } else if (err.response?.status >= 500) {
        message = 'Server sedang bermasalah.';
      } else if (err.request) {
        message = 'Tidak dapat terhubung ke server.';
      }

      set({ error: message, isLoading: false });
      return false;
    }
  },

  /**
   * Clears any displayed error (e.g. after user dismisses the toast).
   */
  clearError: () => set({ error: null }),
}));

export default useSensorStore;

