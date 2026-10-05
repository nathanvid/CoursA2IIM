# CoursA2IIM — Gestionnaire de produits

API FastAPI + frontend HTML/JS pour gérer une liste de produits.

## Prérequis

Installer [uv](https://docs.astral.sh/uv/getting-started/installation/) :

- macOS / Linux : `curl -LsSf https://astral.sh/uv/install.sh | sh`
- Windows (PowerShell) : `powershell -ExecutionPolicy ByPass -c "irm https://astral.sh/uv/install.ps1 | iex"`

uv installe lui-même la bonne version de Python (3.12).

## Lancer le projet

```bash
uv sync
uv run uvicorn backend.main:app --reload
```

Puis ouvrir http://localhost:8000 (interface) ou http://localhost:8000/docs (documentation de l'API).

## Tests

```bash
uv run pytest
```

Les tests tournent automatiquement sur GitHub Actions sous Windows, Linux et macOS à chaque push sur `main` et à chaque pull request (`.github/workflows/tests.yml`).
