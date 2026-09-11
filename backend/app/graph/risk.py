"""
Graph risk and neighborhood topology metrics calculator.
Evaluates money flow, neighbor label distributions, and illicit concentration.
"""

from typing import Dict, Any, List
from sqlalchemy.orm import Session
from backend.app.models import Transaction, TransactionEdge


def calculate_neighborhood_signals(db: Session, transaction_id: int) -> Dict[str, Any]:
    """
    Computes graph neighborhood signals:
    - total neighbors
    - known illicit neighbors
    - known licit neighbors
    - predicted illicit neighbors
    - upstream / downstream breakdown
    """
    # 1. Fetch direct incoming edges (upstream)
    in_edges = db.query(TransactionEdge.source_transaction_id).filter(
        TransactionEdge.destination_transaction_id == transaction_id
    ).all()
    upstream_ids = [r[0] for r in in_edges]

    # 2. Fetch direct outgoing edges (downstream)
    out_edges = db.query(TransactionEdge.destination_transaction_id).filter(
        TransactionEdge.source_transaction_id == transaction_id
    ).all()
    downstream_ids = [r[0] for r in out_edges]

    all_neighbor_ids = list(set(upstream_ids + downstream_ids))

    if not all_neighbor_ids:
        return {
            "total_neighbors": 0,
            "upstream_count": 0,
            "downstream_count": 0,
            "known_illicit_neighbors": 0,
            "known_licit_neighbors": 0,
            "predicted_illicit_neighbors": 0,
            "suspicious_neighbors_count": 0,
            "illicit_neighborhood_ratio": 0.0,
            "graph_signals": [
                {
                    "name": "Isolated Network Topology",
                    "value": "0 direct edges",
                    "description": "Transaction has no connected graph edges within the observed snapshot.",
                    "severity": "low"
                }
            ]
        }

    # Fetch labels and predictions for neighbors
    neighbor_txs = db.query(
        Transaction.transaction_id,
        Transaction.known_label,
        Transaction.prediction,
        Transaction.risk_score
    ).filter(
        Transaction.transaction_id.in_(all_neighbor_ids)
    ).all()

    known_illicit = 0
    known_licit = 0
    predicted_illicit = 0
    suspicious_count = 0

    for n in neighbor_txs:
        is_suspicious = False
        if n.known_label == "ILLICIT":
            known_illicit += 1
            is_suspicious = True
        elif n.known_label == "LICIT":
            known_licit += 1

        if n.prediction == "ILLICIT":
            predicted_illicit += 1
            is_suspicious = True

        if (n.risk_score or 0) >= 60:
            is_suspicious = True

        if is_suspicious:
            suspicious_count += 1

    total_n = len(all_neighbor_ids)
    illicit_ratio = (known_illicit + (0.5 * predicted_illicit)) / max(total_n, 1)

    signals = []
    if known_illicit > 0:
        signals.append({
            "name": "Direct Exposure to Known Illicit Entity",
            "value": f"{known_illicit} neighbor(s)",
            "description": f"Transaction has direct 1-hop flow with confirmed illicit Bitcoin transactions.",
            "severity": "critical"
        })

    if predicted_illicit > 0:
        signals.append({
            "name": "Model-Predicted Suspicious Flow",
            "value": f"{predicted_illicit} neighbor(s)",
            "description": f"Adjacent transactions classified as illicit by the predictive anomaly engine.",
            "severity": "high" if predicted_illicit > 1 else "medium"
        })

    if len(upstream_ids) > 10:
        signals.append({
            "name": "High Aggregation Inflow (Fan-In)",
            "value": f"{len(upstream_ids)} incoming flows",
            "description": "High number of incoming source transactions resembles consolidation / peel-chain aggregation.",
            "severity": "medium"
        })

    if len(downstream_ids) > 10:
        signals.append({
            "name": "High Dispersal Outflow (Fan-Out)",
            "value": f"{len(downstream_ids)} outgoing flows",
            "description": "High number of outgoing destination transactions resembles fund dispersal / layering patterns.",
            "severity": "medium"
        })

    if not signals:
        signals.append({
            "name": "Benign Neighborhood Topology",
            "value": f"{total_n} clean neighbor(s)",
            "description": "All 1-hop adjacent nodes are classified licit or low risk.",
            "severity": "low"
        })

    return {
        "total_neighbors": total_n,
        "upstream_count": len(upstream_ids),
        "downstream_count": len(downstream_ids),
        "known_illicit_neighbors": known_illicit,
        "known_licit_neighbors": known_licit,
        "predicted_illicit_neighbors": predicted_illicit,
        "suspicious_neighbors_count": suspicious_count,
        "illicit_neighborhood_ratio": round(illicit_ratio, 4),
        "graph_signals": signals
    }
