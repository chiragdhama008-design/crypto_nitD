"""
Unit tests for Elliptic label mapping.
Guarantees:
- 1 -> ILLICIT
- 2 -> LICIT
- unknown -> UNKNOWN
- Unknown must NEVER be treated as licit.
"""

import unittest
from backend.app.data_sources.elliptic.mapper import map_elliptic_class
from backend.app.data_sources.common.schemas import KnownLabelEnum


class TestLabelMapping(unittest.TestCase):
    def test_illicit_mapping(self):
        self.assertEqual(map_elliptic_class(1), KnownLabelEnum.ILLICIT)
        self.assertEqual(map_elliptic_class("1"), KnownLabelEnum.ILLICIT)
        self.assertEqual(map_elliptic_class("illicit"), KnownLabelEnum.ILLICIT)

    def test_licit_mapping(self):
        self.assertEqual(map_elliptic_class(2), KnownLabelEnum.LICIT)
        self.assertEqual(map_elliptic_class("2"), KnownLabelEnum.LICIT)
        self.assertEqual(map_elliptic_class("licit"), KnownLabelEnum.LICIT)

    def test_unknown_mapping(self):
        self.assertEqual(map_elliptic_class("unknown"), KnownLabelEnum.UNKNOWN)
        self.assertEqual(map_elliptic_class(3), KnownLabelEnum.UNKNOWN)
        self.assertEqual(map_elliptic_class("3"), KnownLabelEnum.UNKNOWN)
        self.assertEqual(map_elliptic_class(None), KnownLabelEnum.UNKNOWN)
        self.assertEqual(map_elliptic_class("nan"), KnownLabelEnum.UNKNOWN)

    def test_unknown_never_licit(self):
        """Strict contract: unknown must never map to licit."""
        self.assertNotEqual(map_elliptic_class("unknown"), KnownLabelEnum.LICIT)
        self.assertNotEqual(map_elliptic_class(3), KnownLabelEnum.LICIT)


if __name__ == "__main__":
    unittest.main()
