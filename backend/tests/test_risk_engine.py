"""
Unit tests for TRACE-X Deterministic Risk Engine.
"""

import unittest
from backend.app.risk.engine import calculate_risk_score, determine_risk_level
from backend.app.data_sources.common.schemas import RiskLevelEnum


class TestRiskEngine(unittest.TestCase):
    def test_risk_level_bounds(self):
        self.assertEqual(determine_risk_level(95), RiskLevelEnum.CRITICAL)
        self.assertEqual(determine_risk_level(81), RiskLevelEnum.CRITICAL)
        self.assertEqual(determine_risk_level(80), RiskLevelEnum.HIGH)
        self.assertEqual(determine_risk_level(61), RiskLevelEnum.HIGH)
        self.assertEqual(determine_risk_level(60), RiskLevelEnum.MEDIUM)
        self.assertEqual(determine_risk_level(31), RiskLevelEnum.MEDIUM)
        self.assertEqual(determine_risk_level(30), RiskLevelEnum.LOW)
        self.assertEqual(determine_risk_level(0), RiskLevelEnum.LOW)

    def test_ground_truth_illicit_override(self):
        score, level, breakdown = calculate_risk_score(
            known_label="ILLICIT",
            ml_probability=0.1,
            graph_metrics={"known_illicit_neighbors": 0, "total_neighbors": 1}
        )
        self.assertGreaterEqual(score, 90)
        self.assertEqual(level, RiskLevelEnum.CRITICAL)
        self.assertIn("Ground truth verified illicit transaction", breakdown["trigger_reasons"])

    def test_high_probability_and_illicit_exposure(self):
        score, level, breakdown = calculate_risk_score(
            known_label="UNKNOWN",
            ml_probability=0.92,
            graph_metrics={"known_illicit_neighbors": 2, "suspicious_neighbors_count": 3, "total_neighbors": 10}
        )
        self.assertGreaterEqual(score, 75)
        self.assertIn(level, [RiskLevelEnum.HIGH, RiskLevelEnum.CRITICAL])


if __name__ == "__main__":
    unittest.main()
