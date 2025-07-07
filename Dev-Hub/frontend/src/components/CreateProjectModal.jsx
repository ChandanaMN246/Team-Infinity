import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';

const CreateProjectModal = ({ onClose, onProjectCreated }) => {
  const { authFetch, API_BASE_URL } = useAuth();
  const [formData, setFormData] = useState({
    name: '',
    description: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await authFetch(`${API_BASE_URL}/projects/`, {
        method: 'POST',
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        const newProject = await response.json();
        onProjectCreated(newProject);
      } else {
        const errorData = await response.json();
        setError(errorData.detail || 'Failed to create project');
      }
    } catch (error) {
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
          <h3 className="modal-title">Create New Project</h3>
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
            <label htmlFor="name" className="modal-label">
              Project Name
            </label>
            <input
              type="text"
              id="name"
              name="name"
              required
              value={formData.name}
              onChange={handleChange}
              className="modal-input"
              placeholder="Enter project name"
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
              placeholder="Enter project description (optional)"
            />
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
              {loading ? 'Creating...' : 'Create Project'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateProjectModal; 