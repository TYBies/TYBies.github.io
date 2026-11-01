import os
import unittest
from app import payload

class ContractTest(unittest.TestCase):
    def test_health_contract(self):
        version = os.getenv("APP_VERSION", "v1")
        self.assertEqual(payload(version), {"version": version, "status": "ok"})

    def test_versions_are_distinct(self):
        self.assertNotEqual(payload("v1"), payload("v2"))

if __name__ == "__main__":
    unittest.main()
