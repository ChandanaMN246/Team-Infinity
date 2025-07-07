from pydantic import BaseModel, EmailStr
from typing import Optional, List
from datetime import datetime
from enum import Enum

class UserRole(str, Enum):
    ADMIN = "admin"
    MEMBER = "member"
    VIEWER = "viewer"

class DocumentationType(str, Enum):
    MARKDOWN = "markdown"
    LINK = "link"
    CODE_SNIPPET = "code_snippet"

# User schemas
class UserBase(BaseModel):
    email: EmailStr
    username: str

class UserCreate(UserBase):
    password: str

class UserResponse(UserBase):
    id: int
    created_at: datetime
    
    class Config:
        from_attributes = True

# Project schemas
class ProjectBase(BaseModel):
    name: str
    description: Optional[str] = None

class ProjectCreate(ProjectBase):
    pass

class ProjectUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None

class ProjectResponse(ProjectBase):
    id: int
    owner_id: int
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True

class ProjectWithMembers(ProjectResponse):
    members: List[UserResponse] = []
    tasks: List['TaskResponse'] = []

# Task schemas
class TaskBase(BaseModel):
    title: str
    description: Optional[str] = None
    status: Optional[str] = "pending"
    priority: Optional[str] = "medium"

class TaskCreate(TaskBase):
    project_id: int
    assignee_id: Optional[int] = None

class TaskUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    status: Optional[str] = None
    priority: Optional[str] = None
    assignee_id: Optional[int] = None

class TaskResponse(TaskBase):
    id: int
    project_id: int
    assignee_id: Optional[int]
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True

# Documentation schemas
class DocumentationBase(BaseModel):
    title: str
    content: str
    doc_type: DocumentationType
    language: Optional[str] = None
    url: Optional[str] = None

class DocumentationCreate(DocumentationBase):
    project_id: Optional[int] = None
    task_id: Optional[int] = None

class DocumentationUpdate(BaseModel):
    title: Optional[str] = None
    content: Optional[str] = None
    doc_type: Optional[DocumentationType] = None
    language: Optional[str] = None
    url: Optional[str] = None

class DocumentationResponse(DocumentationBase):
    id: int
    author_id: int
    project_id: Optional[int]
    task_id: Optional[int]
    created_at: datetime
    updated_at: datetime
    author: UserResponse
    
    class Config:
        from_attributes = True

# Authentication schemas
class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    username: Optional[str] = None

# Project member schemas
class ProjectMember(BaseModel):
    user_id: int
    role: UserRole

class ProjectMemberResponse(BaseModel):
    user: UserResponse
    role: UserRole 