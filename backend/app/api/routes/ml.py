"""
ML Training and Inference API routes.
"""

from typing import List, Optional
from fastapi import APIRouter, BackgroundTasks, HTTPException
from pydantic import BaseModel
from backend.app.config import settings
from backend.app.ml.predict import predict_transaction

router = APIRouter(prefix="/ml", tags=["Machine Learning"])


class PredictRequest(BaseModel):
    model_config = {"protected_namespaces": ()}

    features: List[float]
    model_name: Optional[str] = "gradient_boosting"


class TrainRequest(BaseModel):
    models: Optional[List[str]] = ["logistic_regression", "random_forest", "gradient_boosting"]


@router.post("/predict")
def predict_endpoint(req: PredictRequest):
    if len(req.features) != 165:
        raise HTTPException(
            status_code=400,
            detail=f"Expected 165 normalized feature values, received {len(req.features)}."
        )

    pred, prob = predict_transaction(req.features, model_name=req.model_name or "gradient_boosting")
    return {
        "model_name": req.model_name,
        "prediction": pred,
        "illicit_probability": round(prob, 4),
        "confidence_score": round(max(prob, 1.0 - prob), 4)
    }


@router.post("/train")
def train_endpoint(req: TrainRequest, background_tasks: BackgroundTasks):
    from scripts.train_model import run_training
    models_to_train = req.models or ["logistic_regression", "random_forest", "gradient_boosting"]
    background_tasks.add_task(
        run_training,
        data_dir=settings.DATASET_PATH,
        model_types=models_to_train,
        update_db=True
    )
    return {
        "message": "Model training initiated in background.",
        "models": models_to_train,
        "strategy": "Temporal Chronological Split (Train: 1-34, Val: 35-39, Test: 40-49)"
    }
