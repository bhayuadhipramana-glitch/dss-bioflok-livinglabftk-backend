<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

/**
 * MlPredictionService
 *
 * Bridges Laravel with the external FastAPI ML microservice.
 * Sends sensor parameters and receives water quality predictions.
 *
 * @see ml_integration.md for architecture rules.
 */
class MlPredictionService
{
    /**
     * Base URL of the FastAPI microservice.
     */
    protected string $baseUrl = 'http://127.0.0.1:5000';

    /**
     * Request a water quality prediction from the ML microservice.
     *
     * @param  float  $temperature  Water temperature (°C)
     * @param  float  $ph           pH level
     * @param  float  $do           Dissolved Oxygen (mg/L)
     * @param  float  $nh3          Ammonia concentration (mg/L)
     * @return array  ['water_condition' => string, 'recommendation' => string]
     */
    public function getPrediction(float $temperature, float $ph, float $do, float $nh3): array
    {
        try {
            $response = Http::timeout(10)->post("{$this->baseUrl}/predict", [
                'temperature' => $temperature,
                'ph'          => $ph,
                'do'          => $do,
                'nh3'         => $nh3,
            ]);

            if ($response->successful()) {
                return [
                    'water_condition'  => $response->json('water_condition', 'Tidak Diketahui'),
                    'recommendation'   => $response->json('recommendation', 'Lakukan pemeriksaan manual.'),
                ];
            }

            Log::warning('ML Microservice returned non-2xx status.', [
                'status' => $response->status(),
                'body'   => $response->body(),
            ]);

        } catch (\Exception $e) {
            Log::error('ML Microservice unreachable.', [
                'error' => $e->getMessage(),
            ]);
        }

        // Fallback: return safe default if ML service is offline or errors
        return [
            'water_condition'  => 'Tidak Diketahui',
            'recommendation'   => 'Server prediksi tidak tersedia. Lakukan pemeriksaan manual.',
        ];
    }
}
