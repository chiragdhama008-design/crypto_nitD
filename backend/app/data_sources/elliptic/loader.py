"""
Elliptic dataset loader implementing BaseCryptoDataSource.
Provides structured streaming, validation, and metadata extraction.
"""

from pathlib import Path
from typing import Iterator, List, Optional, Dict, Any
from backend.app.data_sources.common.base_source import BaseCryptoDataSource
from backend.app.data_sources.common.schemas import (
    NormalizedTransaction,
    NormalizedEdge,
    DataSourceMetadata,
)
from backend.app.data_sources.elliptic.parser import EllipticParser


class EllipticDataSource(BaseCryptoDataSource):
    def __init__(self, data_dir: str):
        super().__init__(source_name="Elliptic Bitcoin Transaction Graph", source_path=data_dir)
        self.parser = EllipticParser(Path(data_dir))
        self._classes_map: Optional[Dict[int, str]] = None
        self._degrees_map: Optional[Dict[int, Dict[str, int]]] = None

    def validate(self) -> bool:
        valid, msg = self.parser.validate_files()
        if not valid:
            print(f"[EllipticDataSource] Validation failed: {msg}")
        return valid

    def get_metadata(self) -> DataSourceMetadata:
        return DataSourceMetadata(
            source_name=self.source_name,
            description="Elliptic Bitcoin transaction dataset with 203,769 transactions, 234,355 directed edges, and 165 features across 49 time steps.",
            total_transactions=203769,
            total_edges=234355,
            total_features=165,
            time_steps_count=49,
            supported_chains=["Bitcoin (BTC)"]
        )

    def _ensure_cache(self):
        if self._classes_map is None:
            self._classes_map = self.parser.load_classes_dict()
        if self._degrees_map is None:
            self._degrees_map = self.parser.calculate_degrees()

    def stream_transactions(self, batch_size: int = 10000) -> Iterator[List[NormalizedTransaction]]:
        self._ensure_cache()
        return self.parser.stream_features_and_transactions(
            classes_map=self._classes_map,
            degrees_map=self._degrees_map,
            batch_size=batch_size
        )

    def stream_edges(self, batch_size: int = 25000) -> Iterator[List[NormalizedEdge]]:
        return self.parser.stream_edges(batch_size=batch_size)

    def get_transaction_features(self, transaction_id: int) -> Optional[List[float]]:
        # Fast streaming lookup if needed directly from CSV
        # Note: In production, this is queried directly from the PostgreSQL features table.
        import pandas as pd
        for chunk in pd.read_csv(self.parser.features_file, header=None, chunksize=10000):
            match = chunk[chunk[0] == transaction_id]
            if not match.empty:
                return match.iloc[0, 2:].tolist()
        return None
