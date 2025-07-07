from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session, joinedload
from typing import List, Optional
from .. import models, schemas, auth
from ..database import get_db

router = APIRouter(prefix="/documentation", tags=["documentation"])

@router.post("/", response_model=schemas.DocumentationResponse)
def create_documentation(
    documentation: schemas.DocumentationCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_user)
):
    """Create new documentation for a project or task"""
    # Validate that either project_id or task_id is provided
    if not documentation.project_id and not documentation.task_id:
        raise HTTPException(status_code=400, detail="Either project_id or task_id must be provided")
    
    # If task_id is provided, validate the task exists and user has access
    if documentation.task_id:
        task = db.query(models.Task).filter(models.Task.id == documentation.task_id).first()
        if not task:
            raise HTTPException(status_code=404, detail="Task not found")
        
        # Check if user has access to the project
        project = db.query(models.Project).filter(models.Project.id == task.project_id).first()
        if not project:
            raise HTTPException(status_code=404, detail="Project not found")
        
        # Check if user is owner or member of the project
        if project.owner_id != current_user.id and current_user not in project.members:
            raise HTTPException(status_code=403, detail="Not authorized to add documentation to this task")
        
        documentation.project_id = task.project_id
    
    # If only project_id is provided, validate the project exists and user has access
    elif documentation.project_id:
        project = db.query(models.Project).filter(models.Project.id == documentation.project_id).first()
        if not project:
            raise HTTPException(status_code=404, detail="Project not found")
        
        # Check if user is owner or member of the project
        if project.owner_id != current_user.id and current_user not in project.members:
            raise HTTPException(status_code=403, detail="Not authorized to add documentation to this project")
    
    # Create the documentation
    db_documentation = models.Documentation(
        **documentation.dict(),
        author_id=current_user.id
    )
    db.add(db_documentation)
    db.commit()
    db.refresh(db_documentation)
    
    # Load the author relationship for response
    db.refresh(db_documentation.author)
    
    return db_documentation

@router.get("/", response_model=List[schemas.DocumentationResponse])
def get_documentation(
    project_id: Optional[int] = Query(None, description="Filter by project ID"),
    task_id: Optional[int] = Query(None, description="Filter by task ID"),
    search: Optional[str] = Query(None, description="Search in title and content"),
    doc_type: Optional[schemas.DocumentationType] = Query(None, description="Filter by documentation type"),
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_user)
):
    """Get documentation with optional filtering"""
    query = db.query(models.Documentation)
    
    # Filter by project_id
    if project_id:
        # Check if user has access to the project
        project = db.query(models.Project).filter(models.Project.id == project_id).first()
        if not project:
            raise HTTPException(status_code=404, detail="Project not found")
        
        if project.owner_id != current_user.id and current_user not in project.members:
            raise HTTPException(status_code=403, detail="Not authorized to view documentation for this project")
        
        query = query.filter(models.Documentation.project_id == project_id)
    
    # Filter by task_id
    if task_id:
        task = db.query(models.Task).filter(models.Task.id == task_id).first()
        if not task:
            raise HTTPException(status_code=404, detail="Task not found")
        
        # Check if user has access to the project
        project = db.query(models.Project).filter(models.Project.id == task.project_id).first()
        if not project:
            raise HTTPException(status_code=404, detail="Project not found")
        
        if project.owner_id != current_user.id and current_user not in project.members:
            raise HTTPException(status_code=403, detail="Not authorized to view documentation for this task")
        
        query = query.filter(models.Documentation.task_id == task_id)
    
    # If no filters provided, show only documentation from projects user has access to
    if not project_id and not task_id:
        user_projects = db.query(models.Project).filter(
            (models.Project.owner_id == current_user.id) |
            (models.Project.members.any(id=current_user.id))
        ).all()
        project_ids = [p.id for p in user_projects]
        query = query.filter(models.Documentation.project_id.in_(project_ids))
    
    # Filter by documentation type
    if doc_type:
        query = query.filter(models.Documentation.doc_type == doc_type)
    
    # Search in title and content
    if search:
        search_filter = f"%{search}%"
        query = query.filter(
            (models.Documentation.title.ilike(search_filter)) |
            (models.Documentation.content.ilike(search_filter))
        )
    
    # Load author relationship
    query = query.options(joinedload(models.Documentation.author))
    
    documentation_list = query.all()
    return documentation_list

@router.get("/{documentation_id}", response_model=schemas.DocumentationResponse)
def get_documentation_by_id(
    documentation_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_user)
):
    """Get specific documentation by ID"""
    documentation = db.query(models.Documentation).filter(
        models.Documentation.id == documentation_id
    ).first()
    
    if not documentation:
        raise HTTPException(status_code=404, detail="Documentation not found")
    
    # Check if user has access to the project
    if documentation.project_id:
        project = db.query(models.Project).filter(models.Project.id == documentation.project_id).first()
        if not project:
            raise HTTPException(status_code=404, detail="Project not found")
        
        if project.owner_id != current_user.id and current_user not in project.members:
            raise HTTPException(status_code=403, detail="Not authorized to view this documentation")
    
    # Load author relationship
    db.refresh(documentation.author)
    
    return documentation

@router.put("/{documentation_id}", response_model=schemas.DocumentationResponse)
def update_documentation(
    documentation_id: int,
    documentation_update: schemas.DocumentationUpdate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_user)
):
    """Update documentation"""
    documentation = db.query(models.Documentation).filter(
        models.Documentation.id == documentation_id
    ).first()
    
    if not documentation:
        raise HTTPException(status_code=404, detail="Documentation not found")
    
    # Check if user is the author or has admin access
    if documentation.author_id != current_user.id:
        # Check if user is project owner
        if documentation.project_id:
            project = db.query(models.Project).filter(models.Project.id == documentation.project_id).first()
            if not project or project.owner_id != current_user.id:
                raise HTTPException(status_code=403, detail="Not authorized to update this documentation")
    
    # Update only provided fields
    update_data = documentation_update.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(documentation, field, value)
    
    db.commit()
    db.refresh(documentation)
    db.refresh(documentation.author)
    
    return documentation

@router.delete("/{documentation_id}")
def delete_documentation(
    documentation_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_user)
):
    """Delete documentation"""
    documentation = db.query(models.Documentation).filter(
        models.Documentation.id == documentation_id
    ).first()
    
    if not documentation:
        raise HTTPException(status_code=404, detail="Documentation not found")
    
    # Check if user is the author or has admin access
    if documentation.author_id != current_user.id:
        # Check if user is project owner
        if documentation.project_id:
            project = db.query(models.Project).filter(models.Project.id == documentation.project_id).first()
            if not project or project.owner_id != current_user.id:
                raise HTTPException(status_code=403, detail="Not authorized to delete this documentation")
    
    db.delete(documentation)
    db.commit()
    
    return {"message": "Documentation deleted successfully"} 