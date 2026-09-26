# OCR Service

OCR microservice untuk IRIS Personal OS.

## Architecture

```
IRIS API (FastAPI) --HTTP--> OCR Service (FastAPI)
                              |
                              v
                         Redis Queue
                              |
                              v
                         Celery Worker
                              |
                              v
                         TrOCR Engine
                              |
                              v
                      Callback to IRIS
```

## Setup

```bash
cd apps/ocr
cp .env.example .env
pip install -r requirements.txt
```

## Run

```bash
# Start Celery worker
celery -A app.core.celery.celery_app worker --loglevel=info

# Start FastAPI server
uvicorn app.main:app --host 0.0.0.0 --port 8001
```

## Endpoints

- `POST /api/v1/ocr/jobs` - Submit OCR job
- `GET /api/v1/ocr/jobs/{task_id}` - Get task status
- `GET /api/v1/ocr/health` - Health check

## Requirements

- Redis (message queue)
- PyTorch + Transformers (TrOCR model)
- FastAPI, Celery, httpx

## Model

Default: `microsoft/trocr-base-handwritten` (tangan bahasa Inggris)

Untuk bahasa Indonesia/perbaikan layout perlu finetuning.
