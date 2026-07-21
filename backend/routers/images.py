import os
import io
import time
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from ..database import get_db
from ..models.db_models import Prediction, User
from ..routers.auth import get_current_user
from ..config import get_settings
from ..utils.image_utils import validate_image, save_upload
from ..services.prediction_service import run_prediction
from ..services.report_service import generate_report
from fastapi.responses import FileResponse, StreamingResponse
from sqlalchemy import desc

router = APIRouter(prefix="/api/images", tags=["images"])
settings = get_settings()

@router.post("/upload")
async def upload_image(
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    file_bytes = await file.read()
    validate_image(file_bytes, file.filename)
    
    timestamp = int(time.time())
    safe_filename = f"{current_user.id}_{timestamp}_{file.filename}"
    
    image_path = await save_upload(file_bytes, safe_filename, settings.UPLOAD_DIR)
    
    # Create DB entry first to get ID
    new_prediction = Prediction(
        user_id=current_user.id,
        image_path=image_path,
        original_filename=file.filename,
        result="processing",
        confidence=0.0,
        processing_time=0.0,
        model_used="unknown"
    )
    db.add(new_prediction)
    db.commit()
    db.refresh(new_prediction)
    
    try:
        pred_data = await run_prediction(image_path, settings.UPLOAD_DIR, new_prediction.id)
        
        new_prediction.result = pred_data["result"]
        new_prediction.confidence = pred_data["confidence"]
        new_prediction.processing_time = pred_data["processing_time"]
        new_prediction.model_used = pred_data["model_used"]
        new_prediction.grad_cam_path = pred_data["grad_cam_path"]
        
        db.commit()
        db.refresh(new_prediction)
        
        return {
            "id": new_prediction.id,
            "result": new_prediction.result,
            "confidence": new_prediction.confidence,
            "processing_time": new_prediction.processing_time,
            "model_used": new_prediction.model_used,
            "grad_cam_path": f"/api/images/gradcam/{new_prediction.id}" if new_prediction.grad_cam_path else None
        }
    except Exception as e:
        db.delete(new_prediction)
        db.commit()
        if os.path.exists(image_path):
            os.remove(image_path)
        raise HTTPException(status_code=500, detail=f"Prediction failed: {str(e)}")

@router.get("/history")
def get_history(
    page: int = 1,
    limit: int = 10,
    search: Optional[str] = None,
    filter_result: Optional[str] = None,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    query = db.query(Prediction).filter(Prediction.user_id == current_user.id)
    
    if search:
        query = query.filter(Prediction.original_filename.ilike(f"%{search}%"))
    if filter_result:
        query = query.filter(Prediction.result == filter_result)
        
    total = query.count()
    predictions = query.order_by(desc(Prediction.created_at)).offset((page - 1) * limit).limit(limit).all()
    
    return {
        "total": total,
        "page": page,
        "limit": limit,
        "data": [{
            "id": p.id,
            "original_filename": p.original_filename,
            "result": p.result,
            "confidence": p.confidence,
            "created_at": p.created_at,
            "grad_cam_available": p.grad_cam_path is not None
        } for p in predictions]
    }

@router.delete("/history/{id}")
def delete_prediction(id: int, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    pred = db.query(Prediction).filter(Prediction.id == id, Prediction.user_id == current_user.id).first()
    if not pred:
        raise HTTPException(status_code=404, detail="Prediction not found")
        
    if pred.image_path and os.path.exists(pred.image_path):
        os.remove(pred.image_path)
    if pred.grad_cam_path and os.path.exists(pred.grad_cam_path):
        os.remove(pred.grad_cam_path)
        
    db.delete(pred)
    db.commit()
    return {"detail": "Deleted successfully"}

@router.get("/download-report/{id}")
def download_report(id: int, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    pred = db.query(Prediction).filter(Prediction.id == id, Prediction.user_id == current_user.id).first()
    if not pred:
        raise HTTPException(status_code=404, detail="Prediction not found")
        
    pred_data = {
        "result": pred.result,
        "confidence": pred.confidence,
        "processing_time": pred.processing_time,
        "model_used": pred.model_used,
        "created_at": str(pred.created_at),
        "image_path": pred.image_path,
        "grad_cam_path": pred.grad_cam_path
    }
    user_data = {
        "username": current_user.username,
        "email": current_user.email
    }
    
    pdf_path = os.path.join(settings.UPLOAD_DIR, f"report_{id}.pdf")
    generate_report(pred_data, user_data, pdf_path)
    
    return FileResponse(
        pdf_path,
        media_type="application/pdf",
        filename=f"forgery_report_{id}.pdf"
    )

@router.get("/gradcam/{id}")
def get_gradcam(id: int, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    pred = db.query(Prediction).filter(Prediction.id == id, Prediction.user_id == current_user.id).first()
    if not pred or not pred.grad_cam_path or not os.path.exists(pred.grad_cam_path):
        raise HTTPException(status_code=404, detail="GradCAM not found")
        
    return FileResponse(pred.grad_cam_path, media_type="image/png")
