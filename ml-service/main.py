"""
Bioflok Water Quality — ML Prediction Microservice
====================================================
Serves Random Forest and K-Means models via FastAPI.
Runs on http://localhost:5000 as per ml_integration.md & api_contract.MD.

Startup: uvicorn main:app --host 0.0.0.0 --port 5000 --reload
"""

import os
import logging
from contextlib import asynccontextmanager

import joblib
import pandas as pd
import numpy as np
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from fastapi.responses import JSONResponse

# ── Logging ──────────────────────────────────────────────────────────────────
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# ── Global Model References ──────────────────────────────────────────────────
rf_model = None
scaler_rf = None
kmeans_model = None
scaler_km = None
metadata = None

BASE_DIR = os.path.dirname(__file__)

# ── Lifespan: load models at startup ─────────────────────────────────────────
@asynccontextmanager
async def lifespan(app: FastAPI):
    """Load all trained models and scalers once on startup."""
    global rf_model, scaler_rf, kmeans_model, scaler_km, metadata

    try:
        rf_model = joblib.load(os.path.join(BASE_DIR, "rf_bioflok.joblib"))
        scaler_rf = joblib.load(os.path.join(BASE_DIR, "scaler_rf_bioflok.joblib"))
        kmeans_model = joblib.load(os.path.join(BASE_DIR, "kmeans_bioflok.joblib"))
        scaler_km = joblib.load(os.path.join(BASE_DIR, "scaler_km_bioflok.joblib"))
        metadata = joblib.load(os.path.join(BASE_DIR, "metadata_bioflok.joblib"))
        logger.info("✅ All ML models and metadata loaded successfully.")
    except Exception as e:
        logger.error("❌ Failed to load ML models. Ensure all 5 .joblib files exist in ml-service/ : %s", e)

    yield  # App runs here

    logger.info("🛑 ML Microservice shutting down.")

# ── FastAPI App ──────────────────────────────────────────────────────────────
app = FastAPI(
    title="Bioflok ML Microservice",
    description="Random Forest (Water Quality) & K-Means (Feed Efficiency).",
    version="1.0.0",
    lifespan=lifespan,
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Request / Response Schemas ───────────────────────────────────────────────
class SensorInput(BaseModel):
    """JSON payload from Laravel — 4 water quality parameters."""
    temperature: float = Field(..., examples=[28.5], description="Water temperature (°C)")
    ph: float = Field(..., examples=[7.2], description="pH level")
    do: float = Field(..., examples=[5.8], description="Dissolved Oxygen (mg/L)")
    nh3: float = Field(..., examples=[0.02], description="Ammonia concentration (mg/L)")

class PredictionResponse(BaseModel):
    status: str = "success"
    water_condition: str
    recommendation: str

# ── Endpoints ────────────────────────────────────────────────────────────────
@app.post(
    "/predict",
    response_model=PredictionResponse,
    summary="Predict water quality and feed efficiency",
)
async def predict(data: SensorInput):
    if not all([rf_model, scaler_rf, kmeans_model, scaler_km, metadata]):
        return JSONResponse(
            status_code=500,
            content={"status": "error", "message": "ML models are not loaded on the server."}
        )

    try:
        # Feature order for the Random Forest model
        feature_order = ["temperature", "ph", "do", "nh3"]
        df_rf = pd.DataFrame([{
            "temperature": data.temperature,
            "ph": data.ph,
            "do": data.do,
            "nh3": data.nh3
        }], columns=feature_order)

        # ── Random Forest Pipeline (Water Quality) ──
        df_rf_scaled = scaler_rf.transform(df_rf)
        rf_pred_numeric = rf_model.predict(df_rf_scaled)[0]
        
        # FIX: Reverse dictionary to map Integer -> String
        label_map = metadata.get("label_map", {})
        reverse_label_map = {v: k for k, v in label_map.items()}
        water_condition = reverse_label_map.get(rf_pred_numeric, "Tidak Diketahui")

        # ── K-Means Pipeline (Feed Efficiency) ──
        kmeans_features = metadata.get("kmeans_features", ["temperature", "nh3"])
        df_km = df_rf[kmeans_features]
        
        df_km_scaled = scaler_km.transform(df_km)
        km_cluster_numeric = kmeans_model.predict(df_km_scaled)[0]
        
        label_semantik = metadata.get("label_semantik", {})
        # Map cluster numeric id to semantic string recommendation
        recommendation = label_semantik.get(km_cluster_numeric, label_semantik.get(str(km_cluster_numeric), str(km_cluster_numeric)))

        return PredictionResponse(
            status="success",
            water_condition=water_condition,
            recommendation=recommendation
        )

    except Exception as e:
        logger.error("Inference failed: %s", e, exc_info=True)
        return JSONResponse(
            status_code=500,
            content={"status": "error", "message": f"Inference error: {str(e)}"}
        )

@app.get("/health", summary="Health check")
async def health():
    return {
        "status": "healthy",
        "models_loaded": all([rf_model, scaler_rf, kmeans_model, scaler_km, metadata])
    }
