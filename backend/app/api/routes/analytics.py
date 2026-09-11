"""
Analytics API routes.
Delivers real statistical distributions, temporal trends, degree curves, and class ratios.
"""

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func, case
from backend.app.database import get_db
from backend.app.models import Transaction, TransactionEdge

router = APIRouter(prefix="/analytics", tags=["Analytics"])


@router.get("/overview")
def get_analytics_overview(db: Session = Depends(get_db)):
    total_tx = db.query(Transaction).count()
    illicit_tx = db.query(Transaction).filter(Transaction.known_label == "ILLICIT").count()
    licit_tx = db.query(Transaction).filter(Transaction.known_label == "LICIT").count()
    unknown_tx = db.query(Transaction).filter(Transaction.known_label == "UNKNOWN").count()
    total_edges = db.query(TransactionEdge).count()

    # Risk tiers
    risk_stats = db.query(
        Transaction.risk_level,
        func.count(Transaction.id)
    ).group_by(Transaction.risk_level).all()
    risk_dict = {r[0]: r[1] for r in risk_stats if r[0]}

    # Degree distribution summary (0-1, 2-5, 6-10, 11-20, 20+)
    degrees = db.query(Transaction.total_degree).limit(10000).all()
    deg_buckets = {"0": 0, "1-2": 0, "3-5": 0, "6-10": 0, "10+": 0}
    for (d,) in degrees:
        if d == 0:
            deg_buckets["0"] += 1
        elif d <= 2:
            deg_buckets["1-2"] += 1
        elif d <= 5:
            deg_buckets["3-5"] += 1
        elif d <= 10:
            deg_buckets["6-10"] += 1
        else:
            deg_buckets["10+"] += 1

    return {
        "total_transactions": total_tx,
        "illicit_transactions": illicit_tx,
        "licit_transactions": licit_tx,
        "unknown_transactions": unknown_tx,
        "total_edges": total_edges,
        "risk_distribution": risk_dict,
        "degree_distribution": deg_buckets
    }


@router.get("/time-series")
@router.get("/temporal")
def get_time_series(db: Session = Depends(get_db)):
    rows = db.query(
        Transaction.time_step,
        func.count(Transaction.id).label("total"),
        func.sum(case((Transaction.known_label == "ILLICIT", 1), else_=0)).label("illicit"),
        func.sum(case((Transaction.known_label == "LICIT", 1), else_=0)).label("licit"),
        func.sum(case((Transaction.known_label == "UNKNOWN", 1), else_=0)).label("unknown")
    ).group_by(Transaction.time_step).order_by(Transaction.time_step.asc()).all()

    return [
        {
            "time_step": r.time_step,
            "total": r.total,
            "illicit": int(r.illicit or 0),
            "licit": int(r.licit or 0),
            "unknown": int(r.unknown or 0)
        }
        for r in rows
    ]
