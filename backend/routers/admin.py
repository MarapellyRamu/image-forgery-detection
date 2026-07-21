"""
Admin router — management endpoints for admin users only.
"""
from datetime import datetime, timedelta
from collections import defaultdict

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func, desc

from ..database import get_db
from ..models.db_models import User, Prediction
from ..routers.auth import get_admin_user

router = APIRouter(prefix="/api/admin", tags=["admin"])


@router.get("/users")
def list_users(current_user: User = Depends(get_admin_user), db: Session = Depends(get_db)):
    users = db.query(User).order_by(User.created_at.desc()).all()
    return [
        {
            "id": u.id,
            "username": u.username,
            "email": u.email,
            "is_admin": u.is_admin,
            "is_active": u.is_active,
            "created_at": u.created_at,
        }
        for u in users
    ]


@router.delete("/users/{user_id}")
def delete_user(
    user_id: int,
    current_user: User = Depends(get_admin_user),
    db: Session = Depends(get_db),
):
    if user_id == current_user.id:
        raise HTTPException(status_code=400, detail="Cannot delete your own account")
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    # Delete all predictions of this user first
    db.query(Prediction).filter(Prediction.user_id == user_id).delete()
    db.delete(user)
    db.commit()
    return {"detail": "User deleted successfully"}


@router.get("/predictions")
def list_all_predictions(
    current_user: User = Depends(get_admin_user),
    db: Session = Depends(get_db),
):
    predictions = db.query(Prediction).order_by(desc(Prediction.created_at)).all()
    return [
        {
            "id": p.id,
            "user_id": p.user_id,
            "original_filename": p.original_filename,
            "result": p.result,
            "confidence": p.confidence,
            "processing_time": p.processing_time,
            "model_used": p.model_used,
            "created_at": p.created_at,
        }
        for p in predictions
    ]


@router.delete("/predictions/{prediction_id}")
def delete_prediction_admin(
    prediction_id: int,
    current_user: User = Depends(get_admin_user),
    db: Session = Depends(get_db),
):
    pred = db.query(Prediction).filter(Prediction.id == prediction_id).first()
    if not pred:
        raise HTTPException(status_code=404, detail="Prediction not found")
    import os
    if pred.image_path and os.path.exists(pred.image_path):
        os.remove(pred.image_path)
    if pred.grad_cam_path and os.path.exists(pred.grad_cam_path):
        os.remove(pred.grad_cam_path)
    db.delete(pred)
    db.commit()
    return {"detail": "Prediction deleted"}


@router.get("/analytics")
def get_analytics(
    current_user: User = Depends(get_admin_user),
    db: Session = Depends(get_db),
):
    total_users = db.query(func.count(User.id)).scalar()
    total_predictions = db.query(func.count(Prediction.id)).scalar()
    authentic_count = db.query(func.count(Prediction.id)).filter(Prediction.result == "authentic").scalar()
    forged_count = db.query(func.count(Prediction.id)).filter(Prediction.result == "forged").scalar()
    avg_confidence_row = db.query(func.avg(Prediction.confidence)).scalar()
    avg_confidence = round(float(avg_confidence_row or 0), 4)

    # Predictions per day for the last 30 days
    thirty_days_ago = datetime.utcnow() - timedelta(days=30)
    recent = (
        db.query(Prediction)
        .filter(Prediction.created_at >= thirty_days_ago)
        .all()
    )
    day_counts: dict = defaultdict(int)
    for p in recent:
        day_str = p.created_at.strftime("%Y-%m-%d")
        day_counts[day_str] += 1

    predictions_by_day = [
        {"date": date, "count": count}
        for date, count in sorted(day_counts.items())
    ]

    return {
        "total_users": total_users,
        "total_predictions": total_predictions,
        "authentic_count": authentic_count,
        "forged_count": forged_count,
        "avg_confidence": avg_confidence,
        "predictions_by_day": predictions_by_day,
    }
