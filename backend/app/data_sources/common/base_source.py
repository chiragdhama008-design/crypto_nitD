"""
Base abstract data source class for TRACE-X.
Defines standard contracts for ingesting, validating, and streaming transaction records.
Designed to support future data sources (Ethereum, Sanctions, Exchanges, DeFi) alongside Elliptic.
"""

from abc import ABC, abstractmethod
from typing import Iterator, List, Dict, Any, Optional
from backend.app.data_sources.common.schemas import (
    NormalizedTransaction,
    NormalizedEdge,
    DataSourceMetadata,
)


class BaseCryptoDataSource(ABC):
    """
    Abstract Base Class for pluggable crypto & financial intelligence data sources.
    """

    def __init__(self, source_name: str, source_path: Optional[str] = None):
        self.source_name = source_name
        self.source_path = source_path

    @abstractmethod
    def validate(self) -> bool:
        """Validate data source connectivity, file existence, or API health."""
        pass

    @abstractmethod
    def get_metadata(self) -> DataSourceMetadata:
        """Return dataset statistics, size, and source metadata."""
        pass

    @abstractmethod
    def stream_transactions(self, batch_size: int = 10000) -> Iterator[List[NormalizedTransaction]]:
        """
        Yield batched normalized transactions with labels, time steps, and graph degrees.
        Never load the entire multi-gigabyte dataset into memory at once.
        """
        pass

    @abstractmethod
    def stream_edges(self, batch_size: int = 25000) -> Iterator[List[NormalizedEdge]]:
        """Yield batched graph edges (directed source -> destination)."""
        pass

    @abstractmethod
    def get_transaction_features(self, transaction_id: int) -> Optional[List[float]]:
        """Retrieve the normalized feature vector for a specific transaction."""
        pass
