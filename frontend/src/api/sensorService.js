import axiosClient from './axiosClient';

export const sensorService = {
    // Fungsi mengambil seluruh riwayat data untuk tabel/grafik
    getAllReadings: async () => {
        const response = await axiosClient.get('/sensor-readings');
        return response.data;
    },

    // Fungsi mengirim input form ke Laravel (Suhu, pH, DO, NH3)
    submitReading: async (data) => {
        const response = await axiosClient.post('/sensor-readings', data);
        return response.data;
    },

    // Fungsi memperbarui data sensor yang sudah ada
    updateReading: async (id, data) => {
        const response = await axiosClient.put(`/sensor-readings/${id}`, data);
        return response.data;
    },

    // Fungsi menghapus data sensor
    deleteReading: async (id) => {
        const response = await axiosClient.delete(`/sensor-readings/${id}`);
        return response.data;
    },
};
