"""
Pydantic schemas for Graph Explorer and Network Traversal.
"""

from typing import List, Optional, Dict, Any
from pydantic import BaseModel


class GraphNode(BaseModel):
    id: str
    transaction_id: int
    label: str               # 'ILLICIT', 'LICIT', 'UNKNOWN'
    prediction: Optional[str] = None
    risk_score: Optional[int] = None
    risk_level: Optional[str] = None
    probability: Optional[float] = None
    time_step: int
    in_degree: int = 0
    out_degree: int = 0
    is_center: bool = False
    hop_level: int = 0


class GraphEdge(BaseModel):
    id: str
    source: str
    target: str
    direction: str = "out"  # 'in' or 'out' relative to center


class GraphMetadata(BaseModel):
    center_transaction_id: int
    depth: int
    total_nodes: int
    total_edges: int
    illicit_count: int
    licit_count: int
    unknown_count: int
    high_risk_count: int
    truncated: bool = False
    max_limit: int = 150


class GraphResponse(BaseModel):
    nodes: List[GraphNode]
    edges: List[GraphEdge]
    metadata: GraphMetadata
