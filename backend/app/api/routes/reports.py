"""
Investigation Reports API route.
Generates comprehensive forensic dossiers and exportable reports for cases.
"""

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from backend.app.database import get_db
from backend.app.reports.generator import ReportGenerator

router = APIRouter(prefix="", tags=["Reports"])


@router.get("/cases/{case_id}/report")
def get_case_report(case_id: int, db: Session = Depends(get_db)):
    report = ReportGenerator.generate_case_report(db, case_id)
    if not report:
        raise HTTPException(status_code=404, detail="Investigation case not found")
    return report
