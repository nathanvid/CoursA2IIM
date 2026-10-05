# CLAUDE.md

Projet pédagogique (cours A2 IIM / ECE) : API FastAPI de gestion de produits + frontend HTML/CSS/JS vanilla.

## Commandes

Gestionnaire de paquets : **uv** (pas de pip / requirements.txt).

- Installer : `uv sync`
- Lancer l'API + le front : `uv run uvicorn backend.main:app --reload` → http://localhost:8000 (docs : `/docs`)
- Tests : `uv run pytest`
- Ajouter une dépendance : `uv add <paquet>` (dev : `uv add --dev <paquet>`)

## Architecture

- `backend/main.py` : toute l'API (CRUD `/products`). Stockage dans `data/products.json` (chemin surchargeable via la variable d'env `PRODUCTS_FILE`). Sert aussi `frontend/` en statique sur `/` — ce montage doit rester **après** les routes de l'API.
- `frontend/` : pas de build. `app.js` appelle l'API sur la même origine (ou `http://localhost:8000` si la page est ouverte en `file://`).
- `tests/test_api.py` : tests via `TestClient`, sur une copie temporaire du JSON (ne jamais modifier `data/products.json` dans les tests).

## Portabilité (les étudiants sont sous Windows, macOS et Linux)

- Aucun chemin absolu : construire les chemins avec `pathlib` à partir de `Path(__file__)`.
- Toujours passer `encoding="utf-8"` aux lectures/écritures de fichiers (l'encodage par défaut de Windows casse les accents).
- Commandes documentées via `uv run …` uniquement, pour qu'elles marchent dans PowerShell comme dans un shell Unix.
