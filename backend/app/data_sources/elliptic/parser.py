"""
Elliptic dataset file parser and validator.
Streams CSV files efficiently using Pandas/csv chunking without loading 700MB into memory all at once.
"""

from pathlib import Path
from typing import Iterator, Tuple, Dict, Any, List
import pandas as pd
from backend.app.data_sources.elliptic.mapper import map_elliptic_class
from backend.app.data_sources.common.schemas import NormalizedTransaction, NormalizedEdge


class EllipticParser:
    def __init__(self, data_dir: Path):
        self.data_dir = Path(data_dir)
        self.classes_file = self.data_dir / "elliptic_txs_classes.csv"
        self.edgelist_file = self.data_dir / "elliptic_txs_edgelist.csv"
        self.features_file = self.data_dir / "elliptic_txs_features.csv"

    def validate_files(self) -> Tuple[bool, str]:
        if not self.data_dir.exists():
            return False, f"Directory not found: {self.data_dir}"
        for f in [self.classes_file, self.edgelist_file, self.features_file]:
            if not f.exists():
                return False, f"Required file missing: {f.name}"
        return True, "All Elliptic CSV files present and accessible."

    def load_classes_dict(self) -> Dict[int, str]:
        """Loads transaction ID -> normalized label map into memory (~200k items = ~15MB RAM)."""
        df = pd.read_csv(self.classes_file)
        tx_ids = df["txId"].astype(int).values
        raw_classes = df["class"].astype(str).values
        classes_map = {}
        for tx_id, cls in zip(tx_ids, raw_classes):
            classes_map[int(tx_id)] = map_elliptic_class(cls).value
        return classes_map

    def calculate_degrees(self) -> Dict[int, Dict[str, int]]:
        """Calculates in-degree, out-degree, total-degree for all transactions."""
        df = pd.read_csv(self.edgelist_file)
        out_deg = df["txId1"].value_counts().to_dict()
        in_deg = df["txId2"].value_counts().to_dict()
        all_nodes = set(out_deg.keys()).union(set(in_deg.keys()))
        
        degrees = {}
        for node in all_nodes:
            od = out_deg.get(node, 0)
            ind = in_deg.get(node, 0)
            degrees[node] = {
                "in_degree": ind,
                "out_degree": od,
                "total_degree": ind + od
            }
        return degrees

    def stream_features_and_transactions(self, classes_map: Dict[int, str], degrees_map: Dict[int, Dict[str, int]], batch_size: int = 10000) -> Iterator[List[NormalizedTransaction]]:
        """
        Streams features file line by line in chunks to build complete NormalizedTransaction instances.
        Features file structure: column 0 = txId, column 1 = time_step, columns 2..166 = 165 features.
        Vectorized row access for high performance.
        """
        for chunk in pd.read_csv(self.features_file, header=None, chunksize=batch_size):
            tx_ids = chunk[0].astype(int).values
            time_steps = chunk[1].astype(int).values
            feats_array = chunk.iloc[:, 2:].values
            n_rows = len(tx_ids)
            
            tx_list = []
            for i in range(n_rows):
                tx_id = int(tx_ids[i])
                ts = int(time_steps[i])
                feats = feats_array[i].tolist()
                label = classes_map.get(tx_id, "UNKNOWN")
                node_deg = degrees_map.get(tx_id, {"in_degree": 0, "out_degree": 0, "total_degree": 0})

                tx = NormalizedTransaction(
                    transaction_id=tx_id,
                    time_step=ts,
                    known_label=label,
                    features=feats,
                    in_degree=node_deg["in_degree"],
                    out_degree=node_deg["out_degree"],
                    total_degree=node_deg["total_degree"]
                )
                tx_list.append(tx)
            yield tx_list

    def stream_edges(self, batch_size: int = 25000) -> Iterator[List[NormalizedEdge]]:
        """Streams directed edges from elliptic_txs_edgelist.csv using fast vectorization."""
        for chunk in pd.read_csv(self.edgelist_file, chunksize=batch_size):
            s_ids = chunk["txId1"].astype(int).values
            d_ids = chunk["txId2"].astype(int).values
            edges = [
                NormalizedEdge(
                    source_transaction_id=int(s),
                    destination_transaction_id=int(d)
                )
                for s, d in zip(s_ids, d_ids)
            ]
            yield edges

