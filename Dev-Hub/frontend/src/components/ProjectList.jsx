import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { PencilSquareIcon, TrashIcon } from '@heroicons/react/24/outline';

const ProjectList = ({ projects, onProjectDeleted, onProjectUpdated, onProjectSelect }) => {
  const { token, API_BASE_URL } = useAuth();
  const [editingProject, setEditingProject] = useState(null);
  const [editForm, setEditForm] = useState({});

  const handleEdit = (project) => {
    setEditingProject(project.id);
    setEditForm({ name: project.name, description: project.description });
  };

  const handleSave = async (projectId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/projects/${projectId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(editForm),
      });

      if (response.ok) {
        const updatedProject = await response.json();
        onProjectUpdated(updatedProject);
        setEditingProject(null);
      }
    } catch (error) {
      console.error('Error updating project:', error);
    }
  };

  const handleDelete = async (projectId) => {
    if (!window.confirm('Are you sure you want to delete this project?')) {
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/projects/${projectId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        onProjectDeleted(projectId);
      }
    } catch (error) {
      console.error('Error deleting project:', error);
    }
  };

  if (projects.length === 0) {
    return (
      <div className="no-projects">No projects found. Create your first project!</div>
    );
  }

  return (
    <div className="project-list">
      {projects.map((project) => (
        <div
          key={project.id}
          className={`project-card${editingProject === project.id ? ' editing' : ''}`}
          onClick={() => onProjectSelect(project)}
        >
          {editingProject === project.id ? (
            <div className="edit-form">
              <input
                type="text"
                value={editForm.name}
                onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                className="edit-input"
                placeholder="Project name"
              />
              <textarea
                value={editForm.description}
                onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                className="edit-input"
                placeholder="Project description"
                rows="2"
              />
              <div className="edit-actions">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleSave(project.id);
                  }}
                  className="primary-btn"
                >
                  Save
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setEditingProject(null);
                  }}
                  className="secondary-btn"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <div className="project-content">
              <div className="project-main">
                <h3 className="project-title">{project.name}</h3>
                {project.description && (
                  <p className="project-desc">{project.description}</p>
                )}
                <p className="project-date">Created: {new Date(project.created_at).toLocaleDateString()}</p>
              </div>
              <div className="project-actions">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleEdit(project);
                  }}
                  className="edit-btn"
                  title="Edit project"
                >
                  <PencilSquareIcon className="icon" />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDelete(project.id);
                  }}
                  className="delete-btn"
                  title="Delete project"
                >
                  <TrashIcon className="icon" />
                </button>
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default ProjectList; 