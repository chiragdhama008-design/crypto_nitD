"""
Temporal dataset preprocessing and splitting for Elliptic Bitcoin Transaction Graph.
Implements chronological train/val/test splits respecting real temporal graph topology.
"""

from typing import Tuple, Optional, Dict, Any
import numpy as np
import pandas as pd
from sklearn.preprocessing import StandardScaler


class EllipticPreprocessor:
    def __init__(
        self,
        train_timesteps: Tuple[int, int] = (1, 34),
        val_timesteps: Tuple[int, int] = (35, 39),
        test_timesteps: Tuple[int, int] = (40, 49)
    ):
        self.train_range = train_timesteps
        self.val_range = val_timesteps
        self.test_range = test_timesteps
        self.scaler = StandardScaler()

    def prepare_data(
        self,
        features_path: str,
        classes_path: str
    ) -> Dict[str, Any]:
        """
        Loads and performs chronological split.
        Crucial requirement: Unknown transactions are separated (not used in supervised train/test).
        """
        print(f"[ML Preprocessing] Loading classes from {classes_path}...")
        classes_df = pd.read_csv(classes_path)
        classes_df["txId"] = classes_df["txId"].astype(int)

        # Map classes: 1 -> 1 (illicit), 2 -> 0 (licit), 'unknown' -> -1
        def map_cls(val):
            s = str(val).strip().lower()
            if s in ("1", "illicit"):
                return 1
            elif s in ("2", "licit"):
                return 0
            return -1

        classes_df["label"] = classes_df["class"].apply(map_cls)

        print(f"[ML Preprocessing] Loading features from {features_path}...")
        # Columns: 0 = txId, 1 = time_step, 2..166 = 165 features
        features_df = pd.read_csv(features_path, header=None)
        features_df.rename(columns={0: "txId", 1: "time_step"}, inplace=True)
        features_df["txId"] = features_df["txId"].astype(int)
        features_df["time_step"] = features_df["time_step"].astype(int)

        # Merge
        merged = pd.merge(features_df, classes_df[["txId", "label"]], on="txId", how="inner")
        feature_cols = [c for c in merged.columns if c not in ("txId", "time_step", "label")]

        # Split into labeled vs unknown
        labeled_mask = merged["label"] != -1
        labeled_df = merged[labeled_mask]
        unknown_df = merged[~labeled_mask]

        # Chronological splits for labeled data
        train_mask = (labeled_df["time_step"] >= self.train_range[0]) & (labeled_df["time_step"] <= self.train_range[1])
        val_mask = (labeled_df["time_step"] >= self.val_range[0]) & (labeled_df["time_step"] <= self.val_range[1])
        test_mask = (labeled_df["time_step"] >= self.test_range[0]) & (labeled_df["time_step"] <= self.test_range[1])

        train_df = labeled_df[train_mask]
        val_df = labeled_df[val_mask]
        test_df = labeled_df[test_mask]

        X_train = train_df[feature_cols].values
        y_train = train_df["label"].values
        X_val = val_df[feature_cols].values
        y_val = val_df["label"].values
        X_test = test_df[feature_cols].values
        y_test = test_df["label"].values

        print(f"[ML Preprocessing] Dataset split results:")
        print(f"  * Training (timesteps {self.train_range[0]}-{self.train_range[1]}): {len(train_df):,} rows (Illicit: {(y_train == 1).sum():,})")
        print(f"  * Validation (timesteps {self.val_range[0]}-{self.val_range[1]}): {len(val_df):,} rows (Illicit: {(y_val == 1).sum():,})")
        print(f"  * Testing (timesteps {self.test_range[0]}-{self.test_range[1]}): {len(test_df):,} rows (Illicit: {(y_test == 1).sum():,})")
        print(f"  * Unknown / Unlabeled: {len(unknown_df):,} rows")

        return {
            "X_train": X_train, "y_train": y_train, "train_txs": train_df["txId"].values,
            "X_val": X_val, "y_val": y_val, "val_txs": val_df["txId"].values,
            "X_test": X_test, "y_test": y_test, "test_txs": test_df["txId"].values,
            "unknown_txs": unknown_df["txId"].values,
            "unknown_X": unknown_df[feature_cols].values,
            "feature_cols": feature_cols
        }
