"""
Action item CRUD, nested under meetings for creation, flat for update/delete
since an item's own ID is enough to identify it once it exists.
"""
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from .. import models, schemas
from ..database import get_db

router = APIRouter(tags=["action-items"])


@router.post("/meetings/{meeting_id}/action-items", response_model=schemas.ActionItemOut)
def create_action_item(meeting_id: int, payload: schemas.ActionItemCreate, db: Session = Depends(get_db)):
    meeting = db.query(models.Meeting).filter(models.Meeting.id == meeting_id).first()
    if not meeting:
        raise HTTPException(status_code=404, detail="Meeting not found")
    item = models.ActionItem(meeting_id=meeting_id, **payload.model_dump())
    db.add(item)
    db.commit()
    db.refresh(item)
    return item


@router.put("/action-items/{item_id}", response_model=schemas.ActionItemOut)
def update_action_item(item_id: int, payload: schemas.ActionItemUpdate, db: Session = Depends(get_db)):
    item = db.query(models.ActionItem).filter(models.ActionItem.id == item_id).first()
    if not item:
        raise HTTPException(status_code=404, detail="Action item not found")
    for field, value in payload.model_dump(exclude_unset=True).items():
        setattr(item, field, value)
    db.commit()
    db.refresh(item)
    return item


@router.delete("/action-items/{item_id}")
def delete_action_item(item_id: int, db: Session = Depends(get_db)):
    item = db.query(models.ActionItem).filter(models.ActionItem.id == item_id).first()
    if not item:
        raise HTTPException(status_code=404, detail="Action item not found")
    db.delete(item)
    db.commit()
    return {"ok": True}
