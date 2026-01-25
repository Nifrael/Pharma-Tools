from fastapi.testclient import TestClient
from backend.api.main import app

client = TestClient(app)

def test_read_health():
    """Vérifie que l'endpoint de santé répond correctement."""
    response = client.get("/health")
    # Note: On ajuste en fonction de ce qu'on a vu dans main.py
    assert response.status_code == 200

def test_search_endpoint():
    """Vérifie que la recherche via l'API fonctionne."""
    # On cherche 'DOLIPRANE'
    response = client.get("/api/search?q=DOLIPRANE")
    assert response.status_code == 200
    results = response.json()
    assert isinstance(results, list)
    if len(results) > 0:
        assert "DOLIPRANE" in results[0]["nom"].upper()
