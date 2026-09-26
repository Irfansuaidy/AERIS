from fastapi import FastAPI
from app.routes.ocr import router as ocr_router
from app.core.config import settings

app = FastAPI(
    title="AERIS OCR Service",
    description="OCR microservice for IRIS Personal OS",
    version="0.1.0",
)

app.include_router(ocr_router, prefix="/api/v1")


@app.get("/")
def root():
    return {"name": "AERIS OCR Service", "status": "running"}
