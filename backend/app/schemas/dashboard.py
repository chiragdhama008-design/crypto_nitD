"""
Pydantic schemas for Risk Engine, Models, Cases, Reports, and Dashboard.
"""

from typing import List, Optional, Dict, Any
from datetime import datetime
from pydantic import BaseModel, Field


# --- Risk & Alerts Schemas ---
class HighRiskTransactionItem(BaseModel):
    transaction_id: int
    time_step: int
    known_label: str
    prediction: Optional[str] = None
    probability: Optional[float] = None
    risk_score: int
    risk_level: str
    in_degree: int
    out_degree: int
    illicit_neighbor_count: int = 0
    trigger_reasons: List[str] = Field(default_factory=list)


class RiskQueueResponse(BaseModel):
    total: int
    critical_count: int
    high_count: int
    medium_count: int
    low_count: int
    transactions: List[HighRiskTransactionItem]


# --- Model Performance Schemas ---
class ConfusionMatrixData(BaseModel):
    true_negative: int
    false_positive: int
    false_negative: int
    true_positive: int


class ROCPoint(BaseModel):
    fpr: float
    tpr: float
    threshold: float


class PRPoint(BaseModel):
    precision: float
    recall: float
    threshold: float


class FeatureImportanceItem(BaseModel):
    feature_index: int
    feature_name: str
    importance: float
    category: str


class ModelMetricsResponse(BaseModel):
    model_config = {"protected_namespaces": ()}

    model_name: str
    accuracy: float
    precision: float
    recall: float
    f1: float
    roc_auc: float
    pr_auc: float
    illicit_precision: float
    illicit_recall: float
    illicit_f1: float
    evaluation_strategy: str
    training_period: str
    validation_period: str
    testing_period: str
    confusion_matrix: ConfusionMatrixData
    roc_curve: List[ROCPoint]
    pr_curve: List[PRPoint]
    feature_importances: List[FeatureImportanceItem]
    created_at: Optional[datetime] = None


# --- Investigation Cases Schemas ---
class CaseCreateRequest(BaseModel):
    case_name: str
    description: Optional[str] = None
    initial_transactions: Optional[List[int]] = None


class CaseUpdateRequest(BaseModel):
    case_name: Optional[str] = None
    description: Optional[str] = None
    status: Optional[str] = None  # 'OPEN', 'UNDER REVIEW', 'CLOSED'


class NoteCreateRequest(BaseModel):
    transaction_id: Optional[int] = None
    note: str
    author: Optional[str] = "Investigator"


class AddTransactionsRequest(BaseModel):
    transaction_ids: List[int]
    notes: Optional[str] = None


class InvestigationNoteResponse(BaseModel):
    id: int
    case_id: int
    transaction_id: Optional[int] = None
    note: str
    author: str
    created_at: datetime


class CaseTransactionResponse(BaseModel):
    transaction_id: int
    time_step: int
    known_label: str
    prediction: Optional[str] = None
    risk_score: Optional[int] = None
    risk_level: Optional[str] = None
    notes: Optional[str] = None
    added_at: datetime


class InvestigationCaseDetail(BaseModel):
    id: int
    case_name: str
    description: Optional[str] = None
    status: str
    created_at: datetime
    updated_at: datetime
    transaction_count: int
    transactions: List[CaseTransactionResponse]
    notes: List[InvestigationNoteResponse]


class InvestigationCaseSummary(BaseModel):
    id: int
    case_name: str
    description: Optional[str] = None
    status: str
    transaction_count: int
    created_at: datetime
    updated_at: datetime


# --- Reports Schemas ---
class InvestigationReportResponse(BaseModel):
    model_config = {"protected_namespaces": ()}

    case_id: int
    case_name: str
    status: str
    created_at: datetime
    generated_at: datetime
    investigator: str
    executive_summary: str
    risk_assessment_summary: Dict[str, Any]
    investigated_transactions: List[CaseTransactionResponse]
    network_findings: Dict[str, Any]
    model_findings: Dict[str, Any]
    evidence_items: List[Dict[str, Any]]
    forensic_notes: List[InvestigationNoteResponse]
    methodology_and_limitations: str


# --- Dashboard Schemas ---
class TimeSeriesMetric(BaseModel):
    time_step: int
    total_txs: int
    illicit_txs: int
    licit_txs: int
    unknown_txs: int


class DashboardOverviewResponse(BaseModel):
    total_transactions: int
    known_transactions: int
    illicit_transactions: int
    licit_transactions: int
    unknown_transactions: int
    total_edges: int
    active_model: str
    risk_distribution: Dict[str, int]
    high_risk_preview: List[HighRiskTransactionItem]
    time_series: List[TimeSeriesMetric]
    database_status: Dict[str, Any]
