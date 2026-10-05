"""API FastAPI de gestion de produits (stockage dans un fichier JSON)."""

import json
import os
from pathlib import Path

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel, Field

# Chemins calculés à partir de ce fichier : fonctionne quel que soit le dossier
# depuis lequel on lance le serveur, et sur Windows comme sur macOS/Linux.
BASE_DIR = Path(__file__).resolve().parent.parent
FRONTEND_DIR = BASE_DIR / "frontend"
DATA_FILE = Path(os.environ.get("PRODUCTS_FILE", BASE_DIR / "data" / "products.json"))


class ProductIn(BaseModel):
    name: str = Field(min_length=1)
    description: str = Field(min_length=1)
    price: float = Field(ge=0)
    stock: int = Field(ge=0)


class Product(ProductIn):
    id: int


def load_products() -> list[dict]:
    if not DATA_FILE.exists():
        return []
    # encoding explicite : sous Windows, l'encodage par défaut n'est pas UTF-8
    with DATA_FILE.open(encoding="utf-8") as f:
        return json.load(f)


def save_products(products: list[dict]) -> None:
    DATA_FILE.parent.mkdir(parents=True, exist_ok=True)
    with DATA_FILE.open("w", encoding="utf-8", newline="\n") as f:
        json.dump(products, f, ensure_ascii=False, indent=4)


app = FastAPI(title="Gestionnaire de Produits")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/products", response_model=list[Product])
def list_products():
    return load_products()


@app.get("/products/{product_id}", response_model=Product)
def get_product(product_id: int):
    for product in load_products():
        if product["id"] == product_id:
            return product
    raise HTTPException(status_code=404, detail="Produit introuvable")


@app.post("/products", response_model=Product, status_code=201)
def create_product(data: ProductIn):
    products = load_products()
    new_id = max((p["id"] for p in products), default=0) + 1
    product = {"id": new_id, **data.model_dump()}
    products.append(product)
    save_products(products)
    return product


@app.put("/products/{product_id}", response_model=Product)
def update_product(product_id: int, data: ProductIn):
    products = load_products()
    for i, product in enumerate(products):
        if product["id"] == product_id:
            products[i] = {"id": product_id, **data.model_dump()}
            save_products(products)
            return products[i]
    raise HTTPException(status_code=404, detail="Produit introuvable")


@app.delete("/products/{product_id}", status_code=204)
def delete_product(product_id: int):
    products = load_products()
    remaining = [p for p in products if p["id"] != product_id]
    if len(remaining) == len(products):
        raise HTTPException(status_code=404, detail="Produit introuvable")
    save_products(remaining)


# Sert le frontend sur http://localhost:8000/ (monté en dernier pour ne pas masquer l'API)
app.mount("/", StaticFiles(directory=FRONTEND_DIR, html=True), name="frontend")
