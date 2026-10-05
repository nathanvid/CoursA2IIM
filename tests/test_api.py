import json
import shutil
from pathlib import Path

import pytest
from fastapi.testclient import TestClient

from backend import main

SEED_FILE = Path(__file__).resolve().parent.parent / "data" / "products.json"


@pytest.fixture
def client(tmp_path, monkeypatch):
    # On travaille sur une copie pour ne pas modifier data/products.json
    data_file = tmp_path / "products.json"
    shutil.copy(SEED_FILE, data_file)
    monkeypatch.setattr(main, "DATA_FILE", data_file)
    return TestClient(main.app)


def test_list_products(client):
    response = client.get("/products")
    assert response.status_code == 200
    names = [p["name"] for p in response.json()]
    assert "Clavier mécanique" in names


def test_get_product(client):
    assert client.get("/products/1").json()["id"] == 1
    assert client.get("/products/999").status_code == 404


def test_create_product_keeps_accents(client):
    payload = {"name": "Écran", "description": "27 pouces, très lumineux", "price": 199.5, "stock": 3}
    response = client.post("/products", json=payload)
    assert response.status_code == 201
    assert response.json()["id"] == 4

    raw = main.DATA_FILE.read_text(encoding="utf-8")
    assert "Écran" in raw
    assert json.loads(raw)[-1]["name"] == "Écran"


def test_create_product_validation(client):
    response = client.post("/products", json={"name": "", "description": "x", "price": -1, "stock": 0})
    assert response.status_code == 422


def test_update_product(client):
    payload = {"name": "Souris", "description": "Filaire", "price": 9.99, "stock": 1}
    response = client.put("/products/2", json=payload)
    assert response.status_code == 200
    assert client.get("/products/2").json()["description"] == "Filaire"
    assert client.put("/products/999", json=payload).status_code == 404


def test_delete_product(client):
    assert client.delete("/products/1").status_code == 204
    assert client.get("/products/1").status_code == 404
    assert client.delete("/products/1").status_code == 404


def test_frontend_is_served(client):
    response = client.get("/")
    assert response.status_code == 200
    assert "Gestionnaire de Produits" in response.text
