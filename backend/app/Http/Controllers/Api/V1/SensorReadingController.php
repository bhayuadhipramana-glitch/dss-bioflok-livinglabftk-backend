<?php

namespace App\Http\Controllers\Api\V1;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use App\Services\MlPredictionService;

class SensorReadingController
{
    // Fungsi untuk mengirim data riwayat ke React (untuk grafik/tabel)
    public function index()
    {
        // Mengambil 50 data terbaru dari tabel sensor_readings
        $readings = DB::table('sensor_readings')->orderBy('created_at', 'desc')->limit(50)->get();
        
        return response()->json([
            'status' => 'success',
            'data' => $readings
        ], 200);
    }

    // Fungsi untuk menerima input dari form React dan menyimpannya ke database
    public function store(Request $request)
    {
        // 1. Validasi input yang masuk (Hanya 4 parameter mutlak)
        $validated = $request->validate([
            'temperature' => 'required|numeric',
            'ph' => 'required|numeric',
            'do' => 'required|numeric',
            'nh3' => 'required|numeric',
        ]);

        // 2. Hubungi Python ML Microservice
        $waterCondition = 'Tidak Diketahui';
        $recommendation = 'Gagal menghubungi service ML';

        try {
            $response = \Illuminate\Support\Facades\Http::post('http://127.0.0.1:5000/predict', [
                'temperature' => (float)$validated['temperature'],
                'ph' => (float)$validated['ph'],
                'do' => (float)$validated['do'],
                'nh3' => (float)$validated['nh3'],
            ]);

            if ($response->successful()) {
                $mlData = $response->json();
                $waterCondition = $mlData['water_condition'] ?? $waterCondition;
                $recommendation = $mlData['recommendation'] ?? $recommendation;
            }
        } catch (\Exception $e) {
            // Biarkan fallback jika service Python mati
        }

        $now = now();

        // 3. Simpan ke database PostgreSQL
        $id = DB::table('sensor_readings')->insertGetId([
            'temperature' => $validated['temperature'],
            'ph' => $validated['ph'],
            'do' => $validated['do'],
            'nh3' => $validated['nh3'],
            'water_condition' => $waterCondition,
            'recommendation' => $recommendation,
            'created_at' => $now,
            'updated_at' => $now,
        ]);

        // 4. Kembalikan record utuh sebagai respon 201 JSON
        return response()->json([
            'status' => 'success',
            'message' => 'Data kualitas air berhasil disimpan!',
            'data' => [
                'id' => $id,
                'temperature' => (float)$validated['temperature'],
                'ph' => (float)$validated['ph'],
                'do' => (float)$validated['do'],
                'nh3' => (float)$validated['nh3'],
                'water_condition' => $waterCondition,
                'recommendation' => $recommendation,
                'created_at' => $now->toIso8601String(),
                'updated_at' => $now->toIso8601String(),
            ]
        ], 201);
    }

    // Fungsi untuk mengambil data terbaru dan memprediksi kondisi air via ML Microservice
    public function checkStatus(Request $request, MlPredictionService $mlService)
    {
        // 1. Ambil data sensor terbaru dari database
        $latest = DB::table('sensor_readings')->orderBy('created_at', 'desc')->first();

        if (!$latest) {
            return response()->json([
                'status' => 'error',
                'message' => 'Belum ada data sensor. Kirim data terlebih dahulu.',
            ], 404);
        }

        // 2. Kirim ke ML Microservice untuk prediksi
        $prediction = $mlService->getPrediction(
            (float) $latest->temperature,
            (float) $latest->ph,
            (float) $latest->do,
            (float) $latest->nh3,
        );

        // 3. Gabungkan data sensor + hasil prediksi dan kembalikan ke frontend
        return response()->json([
            'status' => 'success',
            'data' => [
                'id'              => $latest->id,
                'temperature'     => $latest->temperature,
                'ph'              => $latest->ph,
                'do'              => $latest->do,
                'nh3'             => $latest->nh3,
                'water_condition' => $prediction['water_condition'],
                'recommendation'  => $prediction['recommendation'],
                'created_at'      => $latest->created_at,
            ],
        ], 200);
    }
}