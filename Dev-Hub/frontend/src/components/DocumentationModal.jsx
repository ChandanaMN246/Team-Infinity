import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';

const DocumentationModal = ({ isOpen, onClose, onSave, projectId, taskId, editDoc = null }) => {
  const { authFetch, API_BASE_URL } = useAuth();
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    doc_type: 'MARKDOWN',
    language: '',
    url: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (editDoc) {
      setFormData({
        title: editDoc.title,
        content: editDoc.content,
        doc_type: editDoc.doc_type || 'MARKDOWN',
        language: editDoc.language || '',
        url: editDoc.url || ''
      });
    } else {
      setFormData({
        title: '',
        content: '',
        doc_type: 'MARKDOWN',
        language: '',
        url: ''
      });
    }
  }, [editDoc, isOpen]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      let payload;
      if (editDoc) {
        payload = {
          title: formData.title,
          content: formData.content,
          doc_type: formData.doc_type
        };
        if (formData.doc_type === 'CODE_SNIPPET') {
          payload.language = formData.language;
        }
        if (formData.doc_type === 'LINK') {
          payload.url = formData.url;
        }
        response = await authFetch(`${API_BASE_URL}/documentation/${editDoc.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
      } else {
        payload = {
          title: formData.title,
          content: formData.content,
          doc_type: formData.doc_type,
          project_id: projectId,
          task_id: taskId
        };
        if (formData.doc_type === 'CODE_SNIPPET') {
          payload.language = formData.language;
        }
        if (formData.doc_type === 'LINK') {
          payload.url = formData.url;
        }
        response = await authFetch(`${API_BASE_URL}/documentation/`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
      }

      if (response.ok) {
        const data = await response.json();
        onSave(data);
        onClose();
      } else {
        const errorData = await response.json();
        setError(errorData.detail || 'Failed to save documentation');
      }
    } catch (err) {
      setError('An error occurred while saving documentation');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal">
        <div className="modal-header">
          <h2>{editDoc ? 'Edit Documentation' : 'Add Documentation'}</h2>
          <button className="close-btn" onClick={onClose}>&times;</button>
        </div>

        <form onSubmit={handleSubmit} className="modal-form">
          <div className="form-group">
            <label htmlFor="title">Title *</label>
            <input
              type="text"
              id="title"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              required
              className="form-input"
            />
          </div>

          <div className="form-group">
            <label htmlFor="doc_type">Type *</label>
            <select
              id="doc_type"
              name="doc_type"
              value={formData.doc_type}
              onChange={handleInputChange}
              required
              className="form-select"
            >
              <option value="MARKDOWN">Markdown</option>
              <option value="LINK">Link</option>
              <option value="CODE_SNIPPET">Code Snippet</option>
            </select>
          </div>

          {formData.doc_type === 'LINK' && (
            <div className="form-group">
              <label htmlFor="url">URL *</label>
              <input
                type="url"
                id="url"
                name="url"
                value={formData.url}
                onChange={handleInputChange}
                required
                className="form-input"
                placeholder="https://example.com"
              />
            </div>
          )}

          {formData.doc_type === 'CODE_SNIPPET' && (
            <div className="form-group">
              <label htmlFor="language">Language</label>
              <input
                type="text"
                id="language"
                name="language"
                value={formData.language}
                onChange={handleInputChange}
                className="form-input"
                placeholder="e.g., python, javascript, sql"
              />
            </div>
          )}

          <div className="form-group">
            <label htmlFor="content">
              {formData.doc_type === 'MARKDOWN' ? 'Content (Markdown) *' :
               formData.doc_type === 'LINK' ? 'Description' :
               'Code *'}
            </label>
            <textarea
              id="content"
              name="content"
              value={formData.content}
              onChange={handleInputChange}
              required={formData.doc_type !== 'LINK'}
              className="form-textarea"
              rows={formData.doc_type === 'CODE_SNIPPET' ? 10 : 6}
              placeholder={
                formData.doc_type === 'MARKDOWN' ? '# Your markdown content here...' :
                formData.doc_type === 'LINK' ? 'Optional description of the link...' :
                '// Your code here...'
              }
            />
          </div>

          {error && <div className="error-message">{error}</div>}

          <div className="modal-actions">
            <button type="button" onClick={onClose} className="btn btn-secondary">
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Saving...' : (editDoc ? 'Update' : 'Save')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default DocumentationModal; 