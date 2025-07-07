# Project Management Application

A full-stack project management application with FastAPI backend and React frontend, featuring JWT authentication and role-based access control.

## Features

### Backend (FastAPI)
- JWT-based user authentication
- Role-based access control (Admin, Member, Viewer)
- CRUD operations for projects and tasks
- SQLite database with SQLAlchemy ORM
- Secure password hashing with bcrypt
- CORS support for frontend integration

### Frontend (React)
- User authentication (login/signup)
- Dashboard with project and task management
- Real-time CRUD operations
- Responsive design with Tailwind CSS
- Protected routes and session management

## Project Structure

```
new-project/
├── backend/
│   ├── app/
│   │   ├── __init__.py
│   │   ├── models.py          # Database models
│   │   ├── schemas.py         # Pydantic schemas
│   │   ├── database.py        # Database configuration
│   │   ├── auth.py           # Authentication utilities
│   │   └── routers/
│   │       ├── __init__.py
│   │       ├── auth.py       # Authentication routes
│   │       ├── projects.py   # Project CRUD routes
│   │       └── tasks.py      # Task CRUD routes
│   ├── main.py               # FastAPI application
│   ├── requirements.txt      # Python dependencies
│   └── venv/                 # Virtual environment
└── frontend/
    ├── src/
    │   ├── components/       # React components
    │   ├── contexts/         # React contexts
    │   ├── pages/           # Page components
    │   ├── App.jsx          # Main app component
    │   └── index.css        # Global styles
    ├── package.json         # Node.js dependencies
    └── tailwind.config.js   # Tailwind configuration
```

## Getting Started

### Backend Setup

1. Navigate to the backend directory:
   ```bash
   cd new-project/backend
   ```

2. Create and activate virtual environment:
   ```bash
   python -m venv venv
   # On Windows:
   venv\Scripts\activate
   # On macOS/Linux:
   source venv/bin/activate
   ```

3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

4. Run the FastAPI server:
   ```bash
   uvicorn main:app --reload
   ```

The backend will be available at `http://localhost:8000`

### Frontend Setup

1. Navigate to the frontend directory:
   ```bash
   cd new-project/frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

The frontend will be available at `http://localhost:5173`

## API Endpoints

### Authentication
- `POST /auth/signup` - User registration
- `POST /auth/token` - User login
- `GET /auth/me` - Get current user info

### Projects
- `GET /projects/` - List user's projects
- `POST /projects/` - Create new project
- `GET /projects/{id}` - Get project details
- `PUT /projects/{id}` - Update project
- `DELETE /projects/{id}` - Delete project
- `POST /projects/{id}/members` - Add project member

### Tasks
- `GET /tasks/` - List tasks (with optional project filter)
- `POST /tasks/` - Create new task
- `GET /tasks/{id}` - Get task details
- `PUT /tasks/{id}` - Update task
- `DELETE /tasks/{id}` - Delete task

## Role-Based Access Control

### Project Roles
- **Admin**: Can create, update, delete projects and tasks, manage members
- **Member**: Can create and update tasks, view project details
- **Viewer**: Can only view projects and tasks

### Task Permissions
- **Admin**: Full CRUD access
- **Member**: Can create, update, and view tasks
- **Viewer**: Can only view tasks

## Database Schema

### Users
- id (Primary Key)
- email (Unique)
- username (Unique)
- hashed_password
- created_at

### Projects
- id (Primary Key)
- name
- description
- owner_id (Foreign Key to Users)
- created_at
- updated_at

### Tasks
- id (Primary Key)
- title
- description
- status (pending, in_progress, completed)
- priority (low, medium, high)
- project_id (Foreign Key to Projects)
- assignee_id (Foreign Key to Users)
- created_at
- updated_at

### Project Members (Association Table)
- user_id (Foreign Key to Users)
- project_id (Foreign Key to Projects)
- role (admin, member, viewer)

## Security Features

- JWT token-based authentication
- Password hashing with bcrypt
- Role-based access control
- CORS protection
- Input validation with Pydantic
- SQL injection protection with SQLAlchemy

## Technologies Used

### Backend
- FastAPI
- SQLAlchemy
- SQLite
- Python-Jose (JWT)
- Passlib (Password hashing)
- Pydantic (Data validation)

### Frontend
- React 18
- React Router
- Tailwind CSS
- Vite (Build tool)
- Fetch API (HTTP client) 