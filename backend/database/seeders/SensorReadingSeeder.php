<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Http;
use Carbon\Carbon;

class SensorReadingSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $data = [];
        $mlApiUrl = 'http://127.0.0.1:5000/predict';
        
        // Loop from 29 down to 0 to generate 30 rows chronologically
        for ($i = 29; $i >= 0; $i--) {
            // Generate realistic random floats within safe ranges
            $temperature = mt_rand(250, 320) / 10;
            $ph = mt_rand(65, 85) / 10;
            $do = mt_rand(40, 80) / 10;
            $nh3 = mt_rand(1, 10) / 100;

            $payload = [
                'temperature' => $temperature,
                'ph' => $ph,
                'do' => $do,
                'nh3' => $nh3,
            ];

            // Default fallback values if ML service fails
            $waterCondition = 'Tidak Diketahui';
            $recommendation = 'Gagal menghubungi service ML';

            try {
                // Call Python ML Microservice
                $response = Http::post($mlApiUrl, $payload);
                if ($response->successful()) {
                    $resData = $response->json();
                    $waterCondition = $resData['water_condition'] ?? $waterCondition;
                    $recommendation = $resData['recommendation'] ?? $recommendation;
                }
            } catch (\Exception $e) {
                // Silently fallback if service is unreachable
            }

            // Append to batch insert array
            $data[] = [
                'pond_id' => 1,
                'temperature' => $temperature,
                'ph' => $ph,
                'do' => $do,
                'nh3' => $nh3,
                'water_condition' => $waterCondition,
                'recommendation' => $recommendation,
                // Sequential past timestamps for chronological time-series
                'created_at' => Carbon::now()->subHours($i),
                'updated_at' => Carbon::now()->subHours($i),
            ];
        }

        // Bulk insert the 30 records
        DB::table('sensor_readings')->insert($data);
    }
}
