import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';

const CreateTaskModal = ({ onClose, onTaskCreated, projects, selectedProject }) => {
  const { token, API_BASE_URL } = useAuth();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    status: 'pending',
    priority: 'medium',
    project_id: selectedProject?.id || ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await fetch(`${API_BASE_URL}/tasks/`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        const newTask = await response.json();
        onTaskCreated(newTask);
      } else {
        const errorData = await response.json();
        setError(errorData.detail || 'Failed to create task');
      }
    } catch (error) {
      console.error('Error creating task:', error);
      setError('Network error');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  return (
    <div className="modal-overlay">
      <div className="modal-box">
        <div className="modal-header">
          <h3 className="modal-title">Create New Task</h3>
          <button
            onClick={onClose}
            className="modal-close"
            title="Close"
          >
            5
          </button>
        </div>
        <form onSubmit={handleSubmit} className="modal-form">
          <div>
            <label htmlFor="title" className="modal-label">
              Task Title
            </label>
            <input
              type="text"
              id="title"
              name="title"
              required
              value={formData.title}
              onChange={handleChange}
              className="modal-input"
              placeholder="Enter task title"
            />
          </div>
          <div>
            <label htmlFor="description" className="modal-label">
              Description
            </label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows="3"
              className="modal-input"
              placeholder="Enter task description (optional)"
            />
          </div>
          <div>
            <label htmlFor="project_id" className="modal-label">
              Project
            </label>
            <select
              id="project_id"
              name="project_id"
              required
              value={formData.project_id}
              onChange={handleChange}
              className="modal-input"
            >
              <option value="">Select a project</option>
              {projects.map((project) => (
                <option key={project.id} value={project.id}>
                  {project.name}
                </option>
              ))}
            </select>
          </div>
          <div className="modal-row">
            <div>
              <label htmlFor="status" className="modal-label">
                Status
              </label>
              <select
                id="status"
                name="status"
                value={formData.status}
                onChange={handleChange}
                className="modal-input"
              >
                <option value="pending">Pending</option>
                <option value="in_progress">In Progress</option>
                <option value="completed">Completed</option>
              </select>
            </div>
            <div>
              <label htmlFor="priority" className="modal-label">
                Priority
              </label>
              <select
                id="priority"
                name="priority"
                value={formData.priority}
                onChange={handleChange}
                className="modal-input"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>
          </div>
          {error && (
            <div className="modal-error">{error}</div>
          )}
          <div className="modal-actions">
            <button
              type="button"
              onClick={onClose}
              className="secondary-btn"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="primary-btn"
            >
              {loading ? 'Creating...' : 'Create Task'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateTaskModal; 