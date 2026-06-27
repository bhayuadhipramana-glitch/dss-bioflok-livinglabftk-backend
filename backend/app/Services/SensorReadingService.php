<?php

namespace App\Services;

use App\Models\SensorReading;
use Illuminate\Database\Eloquent\Collection;

class SensorReadingService
{
    public function getAllReadings(): Collection
    {
        return SensorReading::with('pond')->latest()->get();
    }

    public function createReading(array $data): SensorReading
    {
        // 0. Ambil semua data mentah dari payload request
        $temp = $data['temperature'];
        $ph   = $data['ph'];
        $do   = $data['do'] ?? 5.0; // Fallback aman jika data DO kosong
        $nh3  = $data['nh3'] ?? 0.1; // Fallback aman jika data NH3 kosong

        // 1. Ekstraksi Fitur Suhu
        $tempInterp = 'optimal';
        if ($temp < 25 || $temp > 30) {
            $tempInterp = ($temp < 20 || $temp > 32) ? 'kritis' : 'peringatan';
        }

        // 2. Ekstraksi Fitur pH
        $phInterp = 'optimal';
        if ($ph < 6.5 || $ph > 8.0) {
            $phInterp = ($ph < 6.0 || $ph > 8.5) ? 'kritis' : 'peringatan';
        }

        // 3. Ekstraksi Fitur DO (Oksigen Terlarut)
        $doInterp = 'optimal';
        if ($do < 4.0) {
            $doInterp = ($do < 3.0) ? 'kritis' : 'peringatan';
        }

        // 4. Ekstraksi Fitur NH3 (Amonia)
        $nh3Interp = 'optimal';
        if ($nh3 > 1.0) {
            $nh3Interp = ($nh3 > 2.0) ? 'kritis' : 'peringatan';
        }

        // 5. Penentuan Patokan Label (Water Condition) & Analisis Korelasi Algoritma
        if ($tempInterp === 'kritis' || $phInterp === 'kritis' || $doInterp === 'kritis' || $nh3Interp === 'kritis') {
            $waterCondition = 'buruk';
            $notes = 'Korelasi Negatif Kritis: Terdapat parameter di luar batas toleransi. DO rendah atau Amonia tinggi dapat menyebabkan kematian massal bakteri flok dan ikan.';
        } elseif ($tempInterp === 'peringatan' || $phInterp === 'peringatan' || $doInterp === 'peringatan' || $nh3Interp === 'peringatan') {
            $waterCondition = 'waspada';
            $notes = 'Korelasi Peringatan: Fluktuasi lingkungan terdeteksi. Kinerja flok menurun dan FCR berpotensi membengkak akibat nafsu makan ikan berkurang.';
        } else {
            $waterCondition = 'optimal';
            $notes = 'Korelasi Positif: Seluruh parameter (Suhu, pH, DO, NH3) stabil. Kualitas air ideal, efisiensi FCR berada pada tingkat maksimal.';
        }

        // 6. Injeksi hasil interpretasi ke dalam muatan data
        $data['temp_interpretation'] = $tempInterp;
        $data['ph_interpretation']   = $phInterp;
        // Pastikan nama array key ini SAMA PERSIS dengan nama kolom di file Migration Anda
        $data['NH3_condition']       = $nh3Interp; 
        $data['DO_condition']        = $doInterp;
        $data['water_condition']     = $waterCondition;
        $data['correlation_notes']   = $notes;

        return SensorReading::create($data);
    }

    public function getReadingById(int $id): SensorReading
    {
        return SensorReading::with('pond')->findOrFail($id);
    }

    public function deleteReading(SensorReading $reading): void
    {
        $reading->delete();
    }
}