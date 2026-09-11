"""
Dashboard overview API route.
Supplies compact, real summary metrics, temporal distributions, and high-risk preview.
"""

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func, case
from backend.app.database import get_db, get_db_status
from backend.app.config import settings
from backend.app.models import Transaction, TransactionEdge, ModelMetric

router = APIRouter(prefix="/dashboard", tags=["Dashboard"])


@router.get("")
def get_dashboard_overview(db: Session = Depends(get_db)):
    db_status = get_db_status()

    # Total counts
    total_txs = db.query(Transaction).count()
    illicit_txs = db.query(Transaction).filter(Transaction.known_label == "ILLICIT").count()
    licit_txs = db.query(Transaction).filter(Transaction.known_label == "LICIT").count()
    unknown_txs = db.query(Transaction).filter(Transaction.known_label == "UNKNOWN").count()
    known_txs = illicit_txs + licit_txs
    total_edges = db.query(TransactionEdge).count()

    # Risk level distribution
    risk_counts = db.query(
        Transaction.risk_level,
        func.count(Transaction.id)
    ).group_by(Transaction.risk_level).all()
    risk_dist = {"CRITICAL": 0, "HIGH": 0, "MEDIUM": 0, "LOW": 0}
    for r_level, cnt in risk_counts:
        if r_level in risk_dist:
            risk_dist[r_level] = cnt

    # High-Risk transactions preview (top 10 sorted by risk_score desc)
    high_risk_records = db.query(Transaction).filter(
        Transaction.risk_score.isnot(None)
    ).order_by(Transaction.risk_score.desc()).limit(10).all()

    high_risk_preview = [
        {
            "transaction_id": t.transaction_id,
            "time_step": t.time_step,
            "known_label": t.known_label,
            "prediction": t.prediction,
            "probability": round(t.prediction_probability, 4) if t.prediction_probability is not None else None,
            "risk_score": t.risk_score or 0,
            "risk_level": t.risk_level or "LOW",
            "in_degree": t.in_degree,
            "out_degree": t.out_degree,
            "total_degree": t.total_degree
        }
        for t in high_risk_records
    ]

    # Time series breakdown (sampled per timestep)
    time_series_raw = db.query(
        Transaction.time_step,
        func.count(Transaction.id).label("total"),
        func.sum(case((Transaction.known_label == "ILLICIT", 1), else_=0)).label("illicit"),
        func.sum(case((Transaction.known_label == "LICIT", 1), else_=0)).label("licit"),
        func.sum(case((Transaction.known_label == "UNKNOWN", 1), else_=0)).label("unknown")
    ).group_by(Transaction.time_step).order_by(Transaction.time_step.asc()).all()

    time_series = [
        {
            "time_step": row.time_step,
            "total_txs": row.total,
            "illicit_txs": int(row.illicit or 0),
            "licit_txs": int(row.licit or 0),
            "unknown_txs": int(row.unknown or 0)
        }
        for row in time_series_raw
    ]

    return {
        "total_transactions": total_txs,
        "known_transactions": known_txs,
        "illicit_transactions": illicit_txs,
        "licit_transactions": licit_txs,
        "unknown_transactions": unknown_txs,
        "total_edges": total_edges,
        "active_model": settings.ACTIVE_MODEL,
        "risk_distribution": risk_dist,
        "high_risk_preview": high_risk_preview,
        "time_series": time_series,
        "database_status": db_status
    }
