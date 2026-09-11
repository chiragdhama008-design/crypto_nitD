"""
Graph Explorer API route.
Supports depth=1 and depth=2 network queries with node and edge attributes.
"""

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from backend.app.database import get_db
from backend.app.graph.traversal import get_transaction_subgraph

router = APIRouter(prefix="", tags=["Graph"])


@router.get("/transactions/{transaction_id}/graph")
def get_transaction_graph(
    transaction_id: int,
    depth: int = Query(1, ge=1, le=2),
    max_nodes: int = Query(120, ge=10, le=200),
    db: Session = Depends(get_db)
):
    """
    Returns 1-hop or 2-hop graph neighborhood for the specified transaction.
    Bounded by max_nodes to ensure optimal browser rendering.
    """
    graph_data = get_transaction_subgraph(
        db=db,
        transaction_id=transaction_id,
        depth=depth,
        max_nodes=max_nodes
    )

    if not graph_data["nodes"]:
        raise HTTPException(status_code=404, detail="Transaction not found in graph")

    return graph_data
