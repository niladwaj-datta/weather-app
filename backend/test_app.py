import os
import sys
import unittest

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from app import app, c_to_f, kmh_to_mph, get_wmo_info



class WeatherBackendTestCase(unittest.TestCase):
    def setUp(self):
        self.app = app
        self.client = self.app.test_client()

    def test_health_check(self):
        """Test health check endpoint."""
        response = self.client.get("/api/health")
        self.assertEqual(response.status_code, 200)
        data = response.get_json()
        self.assertEqual(data["status"], "healthy")

    def test_converters(self):
        """Test unit conversion helpers."""
        self.assertEqual(c_to_f(0), 32.0)
        self.assertEqual(c_to_f(100), 212.0)
        self.assertEqual(kmh_to_mph(10), 6.2)

    def test_wmo_info(self):
        """Test WMO code translation."""
        clear = get_wmo_info(0)
        self.assertEqual(clear["condition"], "Clear sky")
        self.assertEqual(clear["category"], "clear")

        storm = get_wmo_info(95)
        self.assertEqual(storm["condition"], "Thunderstorm")
        self.assertEqual(storm["category"], "storm")

    def test_missing_query_parameter(self):
        """Test missing parameter returns 400."""
        response = self.client.get("/api/weather")
        self.assertEqual(response.status_code, 400)
        data = response.get_json()
        self.assertIn("error", data)

    def test_invalid_city_search(self):
        """Test non-existent city returns 404."""
        response = self.client.get("/api/weather?city=NonExistentCityXYZ123987")
        self.assertEqual(response.status_code, 404)
        data = response.get_json()
        self.assertIn("error", data)

    def test_valid_city_weather(self):
        """Test weather retrieval for a valid city."""
        response = self.client.get("/api/weather?city=Paris")
        self.assertEqual(response.status_code, 200)
        data = response.get_json()
        self.assertIn("location", data)
        self.assertEqual(data["location"]["name"], "Paris")
        self.assertIn("current", data)
        self.assertIn("hourly", data)
        self.assertIn("daily", data)
        self.assertTrue(len(data["daily"]) > 0)


if __name__ == "__main__":
    unittest.main()
