from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from .. import models, schemas, auth
from ..database import get_db

router = APIRouter(prefix="/tasks", tags=["tasks"])

@router.post("/", response_model=schemas.TaskResponse)
def create_task(
    task: schemas.TaskCreate,
    current_user: models.User = Depends(auth.get_current_user),
    db: Session = Depends(get_db)
):
    # Check if user has access to the project
    user_role = auth.get_user_role_in_project(db, current_user.id, task.project_id)
    if not user_role:
        raise HTTPException(status_code=403, detail="Access denied to project")
    
    # Only members and admins can create tasks
    if user_role not in [models.UserRole.ADMIN, models.UserRole.MEMBER]:
        raise HTTPException(status_code=403, detail="Insufficient permissions")
    
    db_task = models.Task(**task.dict())
    db.add(db_task)
    db.commit()
    db.refresh(db_task)
    return db_task

@router.get("/", response_model=List[schemas.TaskResponse])
def get_tasks(
    project_id: int = None,
    current_user: models.User = Depends(auth.get_current_user),
    db: Session = Depends(get_db)
):
    if project_id:
        # Check if user has access to the project
        user_role = auth.get_user_role_in_project(db, current_user.id, project_id)
        if not user_role:
            raise HTTPException(status_code=403, detail="Access denied to project")
        
        tasks = db.query(models.Task).filter(models.Task.project_id == project_id).all()
    else:
        # Get all tasks from projects user has access to
        user_projects = db.query(models.Project).filter(
            (models.Project.owner_id == current_user.id) |
            (models.Project.members.any(id=current_user.id))
        ).all()
        project_ids = [p.id for p in user_projects]
        tasks = db.query(models.Task).filter(models.Task.project_id.in_(project_ids)).all()
    
    return tasks

@router.get("/{task_id}", response_model=schemas.TaskResponse)
def get_task(
    task_id: int,
    current_user: models.User = Depends(auth.get_current_user),
    db: Session = Depends(get_db)
):
    task = db.query(models.Task).filter(models.Task.id == task_id).first()
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    
    # Check if user has access to the project
    user_role = auth.get_user_role_in_project(db, current_user.id, task.project_id)
    if not user_role:
        raise HTTPException(status_code=403, detail="Access denied to project")
    
    return task

@router.put("/{task_id}", response_model=schemas.TaskResponse)
def update_task(
    task_id: int,
    task_update: schemas.TaskUpdate,
    current_user: models.User = Depends(auth.get_current_user),
    db: Session = Depends(get_db)
):
    task = db.query(models.Task).filter(models.Task.id == task_id).first()
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    
    # Check if user has access to the project
    user_role = auth.get_user_role_in_project(db, current_user.id, task.project_id)
    if not user_role:
        raise HTTPException(status_code=403, detail="Access denied to project")
    
    # Only members and admins can update tasks
    if user_role not in [models.UserRole.ADMIN, models.UserRole.MEMBER]:
        raise HTTPException(status_code=403, detail="Insufficient permissions")
    
    for field, value in task_update.dict(exclude_unset=True).items():
        setattr(task, field, value)
    
    db.commit()
    db.refresh(task)
    return task

@router.delete("/{task_id}")
def delete_task(
    task_id: int,
    current_user: models.User = Depends(auth.get_current_user),
    db: Session = Depends(get_db)
):
    task = db.query(models.Task).filter(models.Task.id == task_id).first()
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    
    # Check if user has access to the project
    user_role = auth.get_user_role_in_project(db, current_user.id, task.project_id)
    if not user_role:
        raise HTTPException(status_code=403, detail="Access denied to project")
    
    # Only admins can delete tasks
    if user_role not in [models.UserRole.ADMIN]:
        raise HTTPException(status_code=403, detail="Only admins can delete tasks")
    
    db.delete(task)
    db.commit()
    return {"message": "Task deleted successfully"} 