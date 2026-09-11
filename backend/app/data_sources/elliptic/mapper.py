"""
Elliptic dataset label and feature mappers.
Strictly guarantees:
- 1 -> ILLICIT
- 2 -> LICIT
- unknown / 3 -> UNKNOWN (never coerced to licit)
"""

from typing import Union
from backend.app.data_sources.common.schemas import KnownLabelEnum


def map_elliptic_class(raw_class: Union[str, int, float]) -> KnownLabelEnum:
    """
    Maps raw Elliptic class string/integer into standardized KnownLabelEnum.
    Crucial rule: unknown must NOT be treated as licit.
    """
    clean_val = str(raw_class).strip().lower()
    if clean_val in ("1", "illicit"):
        return KnownLabelEnum.ILLICIT
    elif clean_val in ("2", "licit"):
        return KnownLabelEnum.LICIT
    elif clean_val in ("unknown", "3", "null", "none", "nan"):
        return KnownLabelEnum.UNKNOWN
    else:
        return KnownLabelEnum.UNKNOWN


def get_feature_categories() -> dict:
    """
    Returns the categorical breakdown of the 165 features from the Elliptic paper:
    Features 1..93: Local features (transaction volume, fees, time, input/output counts, scripts)
    Features 94..165: Aggregated neighborhood features (1-hop neighbors: min/max/mean/std of volume, fees, etc.)
    """
    return {
        "local_features": {
            "name": "Local Transaction Features",
            "range": (0, 93),
            "description": "Standardized metrics regarding transaction amount, fee, transaction inputs, outputs, and script types."
        },
        "aggregate_features": {
            "name": "Neighborhood Aggregate Features",
            "range": (93, 165),
            "description": "Aggregated 1-hop neighborhood statistics including mean, standard deviation, minimum, and maximum of neighboring transaction attributes."
        }
    }
