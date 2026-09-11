"""
Integration tests for TRACE-X FastAPI endpoints.
"""

import unittest
from fastapi.testclient import TestClient
from backend.app.main import app


class TestApiEndpoints(unittest.TestCase):
    def setUp(self):
        self.client = TestClient(app)

    def test_health_endpoint(self):
        res = self.client.get("/api/health")
        self.assertEqual(res.status_code, 200)
        data = res.json()
        self.assertEqual(data["status"], "healthy")
        self.assertIn("database", data)

    def test_dashboard_endpoint(self):
        res = self.client.get("/api/dashboard")
        self.assertEqual(res.status_code, 200)
        data = res.json()
        self.assertIn("total_transactions", data)
        self.assertIn("risk_distribution", data)

    def test_transactions_endpoint(self):
        res = self.client.get("/api/transactions?limit=10")
        self.assertEqual(res.status_code, 200)
        data = res.json()
        self.assertIn("transactions", data)
        self.assertIn("total", data)

    def test_models_endpoint(self):
        res = self.client.get("/api/models")
        self.assertEqual(res.status_code, 200)
        data = res.json()
        self.assertIn("active_model", data)

    def test_cases_crud(self):
        # Create case
        create_res = self.client.post("/api/cases", json={
            "case_name": "Automated Unit Test Case",
            "description": "Integration test created case."
        })
        self.assertEqual(create_res.status_code, 200)
        case_data = create_res.json()
        case_id = case_data["id"]

        # Fetch case
        get_res = self.client.get(f"/api/cases/{case_id}")
        self.assertEqual(get_res.status_code, 200)

        # Add note
        note_res = self.client.post(f"/api/cases/{case_id}/notes", json={
            "note": "Test note from integration suite."
        })
        self.assertEqual(note_res.status_code, 200)

        # Generate report
        rep_res = self.client.get(f"/api/cases/{case_id}/report")
        self.assertEqual(rep_res.status_code, 200)


if __name__ == "__main__":
    unittest.main()
