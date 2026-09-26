import httpx
from PIL import Image
from transformers import TrOCRProcessor, VisionEncoderDecoderModel
import torch
from io import BytesIO

from app.core.celery import celery_app
from app.core.config import settings
from app.models.task import TaskStatus


processor = None
model = None


def load_model():
    global processor, model
    if processor is None or model is None:
        processor = TrOCRProcessor.from_pretrained(settings.model_name)
        model = VisionEncoderDecoderModel.from_pretrained(settings.model_name)
        model.to(settings.device)
    return processor, model


@celery_app.task(bind=True, name="app.services.ocr_worker.process_ocr")
def process_ocr(self, document_id: str, file_url: str, callback_url: str):
    try:
        self.update_state(state=TaskStatus.PROCESSING.value)
        
        async_client = httpx.Client(timeout=30.0)
        
        response = async_client.get(file_url)
        response.raise_for_status()
        
        image = Image.open(BytesIO(response.content)).convert("RGB")
        
        proc, mdl = load_model()
        
        pixel_values = proc(image, return_tensors="pt").pixel_values.to(settings.device)
        
        with torch.no_grad():
            generated_ids = mdl.generate(pixel_values)
        
        text = proc.batch_decode(generated_ids, skip_special_tokens=True)[0]
        
        callback_data = {
            "document_id": document_id,
            "status": TaskStatus.COMPLETED.value,
            "result": text,
            "task_id": self.request.id,
        }
        
        async_client.post(
            callback_url,
            json=callback_data,
            headers={"X-API-Key": settings.iris_api_key},
        )
        
        async_client.close()
        
        return {
            "status": TaskStatus.COMPLETED.value,
            "result": text,
        }
    
    except Exception as e:
        error_msg = str(e)
        
        try:
            async_client = httpx.Client(timeout=30.0)
            async_client.post(
                callback_url,
                json={
                    "document_id": document_id,
                    "status": TaskStatus.FAILED.value,
                    "error": error_msg,
                    "task_id": self.request.id,
                },
                headers={"X-API-Key": settings.iris_api_key},
            )
            async_client.close()
        except:
            pass
        
        return {
            "status": TaskStatus.FAILED.value,
            "error": error_msg,
        }
