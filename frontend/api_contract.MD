# API Contract & Data Flow Specification
Project: Bioflok Water Quality Monitoring

## 🚨 STRICT RULES
1. ONLY use these exactly named parameters: `temperature`, `ph`, `do`, `nh3`.
2. NEVER use the words "DSS", "SPK", or "Decision Support" in any variable, route, or response.
3. Architecture: React (Frontend) <-> Laravel (Main Backend) <-> FastAPI (ML Microservice).

## 1. Frontend to Laravel (Save Sensor Data)
- **Endpoint:** `POST /api/sensor-readings`
- **Payload (JSON):**
  {
    "pond_id": 1,
    "temperature": 28.5,
    "ph": 7.2,
    "do": 5.8,
    "nh3": 0.02
  }

## 2. Laravel to FastAPI (Request Prediction)
- **Endpoint:** `POST http://localhost:5000/predict` (Internal Server Request)
- **Payload (JSON):**
  {
    "temperature": 28.5,
    "ph": 7.2,
    "do": 5.8,
    "nh3": 0.02
  }

## 3. FastAPI to Laravel (Prediction Response)
- **Response (JSON):**
  {
    "water_condition": "Optimal",
    "recommendation": "Pertahankan rasio pakan normal (100%)."
  }

## 4. Laravel to Frontend (Final Response after DB Save)
- **Response (JSON):**
  {
    "status": "success",
    "message": "Data berhasil disimpan dan dianalisis.",
    "data": {
      "id": 15,
      "pond_id": 1,
      "temperature": 28.5,
      "ph": 7.2,
      "do": 5.8,
      "nh3": 0.02,
      "water_condition": "Optimal",
      "recommendation": "Pertahankan rasio pakan normal (100%).",
      "created_at": "2026-07-01T08:00:00Z"
    }
  }