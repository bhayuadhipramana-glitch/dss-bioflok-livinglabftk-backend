# Machine Learning Microservice Integration (FastAPI)

## 🚨 CORE ARCHITECTURE RULES
1. The Machine Learning model MUST run as a separate standalone microservice using Python (FastAPI).
2. Laravel MUST NOT load or execute the ML model directly. Laravel acts as an API Gateway that forwards data to FastAPI.
3. The ML Microservice will run locally on `http://localhost:5000`.

## ML Microservice Requirements (Python)
- **Framework:** FastAPI
- **Server:** Uvicorn
- **Task:** 1. Load the pre-trained Data Mining model (e.g., `model.pkl` or similar format from the root ML folder).
  2. Create a `POST /predict` route.
  3. Accept JSON data containing `temperature`, `ph`, `do`, and `nh3`.
  4. Pass the data into the model for inference.
  5. Return a JSON response with `water_condition` (e.g., "Optimal", "Siaga", "Kritis") and a corresponding text `recommendation`.

## Laravel Integration Requirements (PHP)
- **Task:**
  1. Create a service class in Laravel (e.g., `MlPredictionService`).
  2. Use Laravel's `Http` facade to send a POST request to the FastAPI endpoint (`http://localhost:5000/predict`).
  3. Catch any connection timeouts or errors (Fallback: return "Status Tidak Diketahui" if the Python server is offline).
  4. Save the ML response (`water_condition` and `recommendation`) into the `sensor_readings` table along with the raw sensor data.