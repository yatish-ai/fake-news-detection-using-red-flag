import os
import sys
from fastapi.testclient import TestClient

# Add app folder to sys.path
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.main import app

client = TestClient(app)

def test_health_check():
    """Verify that the health check returns a 200 and indicates model loading status."""
    response = client.get("/health")
    assert response.status_code == 200
    data = response.json()
    assert "status" in data
    assert data["status"] == "healthy"
    assert "model_loaded" in data

def test_predict_endpoint_validation():
    """Verify that the prediction endpoint rejects invalid payload structures."""
    # Title too short
    response = client.post(
        "/predict",
        json={"title": "A", "text": "This is valid text structure."}
    )
    assert response.status_code == 422
    
    # Text too short
    response = client.post(
        "/predict",
        json={"title": "This is a valid title", "text": "Short"}
    )
    assert response.status_code == 422

def test_predict_endpoint_success():
    """Verify that the prediction endpoint returns the expected schema structure."""
    response = client.post(
        "/predict",
        json={
            "title": "Breaking News: Major discovery in physics",
            "text": "Scientists at CERN have announced a new subatomic particle that could rewrite the laws of quantum mechanics. Detailed tests are underway."
        }
    )
    assert response.status_code == 200
    data = response.json()
    assert "prediction" in data
    assert data["prediction"] in ["REAL", "FAKE"]
    assert "confidence" in data
    assert 50.0 <= data["confidence"] <= 100.0
    assert "explanation" in data
    assert "key_terms" in data
    assert isinstance(data["key_terms"], list)

def test_latest_news_endpoint():
    """Verify that latest-news returns a list of articles."""
    response = client.get("/latest-news")
    assert response.status_code == 200
    data = response.json()
    assert "status" in data
    assert data["status"] == "ok"
    assert "articles" in data
    assert len(data["articles"]) > 0
    
    # Check article structure
    art = data["articles"][0]
    assert "title" in art
    assert "url" in art
    assert "source" in art

def test_scrape_url_invalid():
    """Verify that scrape-url handles invalid URLs gracefully by returning success=False instead of throwing 500."""
    response = client.post(
        "/scrape-url",
        json={"url": "not-a-valid-http-url"}
    )
    assert response.status_code == 200
    data = response.json()
    assert "success" in data
    assert data["success"] is False
    assert "message" in data


def test_predict_includes_red_flag_analysis():
    response = client.post(
        "/predict",
        json={
            "title": "SHOCKING!!! You won't believe this secret discovery",
            "text": "This is a guaranteed miracle and everyone should click here to see what happens next."
        }
    )
    assert response.status_code == 200
    analysis = response.json()["red_flag_analysis"]
    assert 0 <= analysis["score"] <= 100
    assert analysis["level"] in ["Low", "Moderate", "High"]
    assert len(analysis["flags"]) > 0
    assert "not proof" in analysis["disclaimer"]
