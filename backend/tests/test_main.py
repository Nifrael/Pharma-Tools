from fastapi.testclient import TestClient
from api.main import app

client = TestClient(app)

def test_read_health():
    """Vérifie que l'endpoint de santé répond correctement."""
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json() == {"status": "ok"}
