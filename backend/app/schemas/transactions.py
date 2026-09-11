"""
Pydantic schemas for transactions, features, intelligence, and evidence.
"""

from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field


class TransactionSummary(BaseModel):
    transaction_id: int
    time_step: int
    known_label: str
    prediction: Optional[str] = None
    prediction_probability: Optional[float] = None
    risk_score: Optional[int] = None
    risk_level: Optional[str] = None
    in_degree: int = 0
    out_degree: int = 0
    total_degree: int = 0

    class Config:
        from_attributes = True


class PaginatedTransactionsResponse(BaseModel):
    total: int
    page: int
    limit: int
    total_pages: int
    transactions: List[TransactionSummary]


class FeatureItem(BaseModel):
    index: int
    name: str
    category: str
    value: float


class CategorizedFeaturesResponse(BaseModel):
    transaction_id: int
    total_features: int
    local_features: List[FeatureItem]
    aggregate_features: List[FeatureItem]


class MLSignal(BaseModel):
    name: str
    value: str
    description: str
    severity: str  # 'low', 'medium', 'high', 'critical'


class GraphSignal(BaseModel):
    name: str
    value: str
    description: str
    severity: str


class FeatureSignal(BaseModel):
    name: str
    value: str
    description: str
    severity: str


class TransactionIntelligenceResponse(BaseModel):
    transaction_id: int
    ml_signals: List[MLSignal]
    graph_signals: List[GraphSignal]
    feature_signals: List[FeatureSignal]
    risk_summary: Dict[str, Any]


class TransactionEvidenceItem(BaseModel):
    category: str
    indicator: str
    observation: str
    forensic_significance: str
    confidence: str


class TransactionEvidenceResponse(BaseModel):
    transaction_id: int
    evidence_items: List[TransactionEvidenceItem]
    disclaimer: str = "Model-derived forensic intelligence. Research-oriented indicators do not constitute legal proof."
