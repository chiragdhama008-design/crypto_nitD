"""
Common schemas for data source ingestion and normalization in TRACE-X.
"""

from enum import Enum
from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field


class KnownLabelEnum(str, Enum):
    ILLICIT = "ILLICIT"
    LICIT = "LICIT"
    UNKNOWN = "UNKNOWN"


class RiskLevelEnum(str, Enum):
    LOW = "LOW"
    MEDIUM = "MEDIUM"
    HIGH = "HIGH"
    CRITICAL = "CRITICAL"


class NormalizedTransaction(BaseModel):
    transaction_id: int
    time_step: int
    known_label: KnownLabelEnum
    features: Optional[List[float]] = None
    in_degree: int = 0
    out_degree: int = 0
    total_degree: int = 0
    metadata: Dict[str, Any] = Field(default_factory=dict)


class NormalizedEdge(BaseModel):
    source_transaction_id: int
    destination_transaction_id: int


class DataSourceMetadata(BaseModel):
    source_name: str
    description: str
    total_transactions: int
    total_edges: int
    total_features: int
    time_steps_count: int
    supported_chains: List[str]
