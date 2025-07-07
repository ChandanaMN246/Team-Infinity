import React, { useState, useEffect } from 'react';
import DocumentationModal from './DocumentationModal';
import { useAuth } from '../contexts/AuthContext';

const DocumentationList = ({ projectId, taskId }) => {
  const { authFetch, API_BASE_URL } = useAuth();
  const [documentation, setDocumentation] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingDoc, setEditingDoc] = useState(null);

  const fetchDocumentation = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (projectId) params.append('project_id', projectId);
      if (taskId) params.append('task_id', taskId);
      if (searchTerm) params.append('search', searchTerm);
      if (filterType) params.append('doc_type', filterType);

      const response = await authFetch(`${API_BASE_URL}/documentation/?${params.toString()}`);
      if (response.ok) {
        const data = await response.json();
        setDocumentation(data);
      } else {
        let errorMsg = 'Failed to fetch documentation';
        try {
          const errorData = await response.json();
          if (errorData.detail) errorMsg = errorData.detail;
        } catch {}
        setError(errorMsg);
      }
    } catch (err) {
      setError('An error occurred while fetching documentation');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDocumentation();
  }, [projectId, taskId, searchTerm, filterType]);

  const handleSave = (savedDoc) => {
    if (editingDoc) {
      setDocumentation(prev => prev.map(doc => 
        doc.id === savedDoc.id ? savedDoc : doc
      ));
    } else {
      setDocumentation(prev => [savedDoc, ...prev]);
    }
  };

  const handleDelete = async (docId) => {
    if (!window.confirm('Are you sure you want to delete this documentation?')) {
      return;
    }

    try {
      const response = await authFetch(`${API_BASE_URL}/documentation/${docId}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        setDocumentation(prev => prev.filter(doc => doc.id !== docId));
      } else {
        let errorMsg = 'Failed to delete documentation';
        try {
          const errorData = await response.json();
          if (errorData.detail) errorMsg = errorData.detail;
        } catch {}
        setError(errorMsg);
      }
    } catch (err) {
      setError('An error occurred while deleting documentation');
    }
  };

  const handleEdit = (doc) => {
    setEditingDoc(doc);
    setShowModal(true);
  };

  const handleAddNew = () => {
    setEditingDoc(null);
    setShowModal(true);
  };

  const renderDocumentationContent = (doc) => {
    switch (doc.doc_type) {
      case 'markdown':
        return (
          <div className="doc-content">
            <div className="markdown-preview">
              {doc.content.split('\n').map((line, index) => {
                if (line.startsWith('# ')) {
                  return <h3 key={index}>{line.substring(2)}</h3>;
                } else if (line.startsWith('## ')) {
                  return <h4 key={index}>{line.substring(3)}</h4>;
                } else if (line.startsWith('**') && line.endsWith('**')) {
                  return <strong key={index}>{line.substring(2, line.length - 2)}</strong>;
                } else if (line.startsWith('- ')) {
                  return <li key={index}>{line.substring(2)}</li>;
                } else {
                  return <p key={index}>{line}</p>;
                }
              })}
            </div>
          </div>
        );

      case 'link':
        return (
          <div className="doc-content">
            <a 
              href={doc.url} 
              target="_blank" 
              rel="noopener noreferrer"
              className="doc-link"
            >
              {doc.url}
            </a>
            {doc.content && <p className="doc-description">{doc.content}</p>}
          </div>
        );

      case 'code_snippet':
        return (
          <div className="doc-content">
            <div className="code-snippet">
              <div className="code-header">
                <span className="language-tag">{doc.language || 'code'}</span>
              </div>
              <pre className="code-content">
                <code>{doc.content}</code>
              </pre>
            </div>
          </div>
        );

      default:
        return <div className="doc-content">{doc.content}</div>;
    }
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case 'markdown': return '📝';
      case 'link': return '🔗';
      case 'code_snippet': return '💻';
      default: return '📄';
    }
  };

  const getTypeLabel = (type) => {
    switch (type) {
      case 'markdown': return 'Markdown';
      case 'link': return 'Link';
      case 'code_snippet': return 'Code Snippet';
      default: return type;
    }
  };

  if (loading) {
    return <div className="loading">Loading documentation...</div>;
  }

  return (
    <div className="documentation-list">
      <div className="documentation-header">
        <h3>Documentation</h3>
        <button onClick={handleAddNew} className="btn btn-primary">
          Add Documentation
        </button>
      </div>

      <div className="documentation-filters">
        <div className="search-box">
          <input
            type="text"
            placeholder="Search documentation..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
        </div>
        <select
          value={filterType}
          onChange={(e) => setFilterType(e.target.value)}
          className="filter-select"
        >
          <option value="">All Types</option>
          <option value="markdown">Markdown</option>
          <option value="link">Links</option>
          <option value="code_snippet">Code Snippets</option>
        </select>
      </div>

      {error && <div className="error-message">{error}</div>}

      {documentation.length === 0 ? (
        <div className="empty-state">
          <p>No documentation found. Add some documentation to get started!</p>
        </div>
      ) : (
        <div className="documentation-grid">
          {documentation.map((doc) => (
            <div key={doc.id} className="documentation-card">
              <div className="doc-header">
                <div className="doc-title">
                  <span className="doc-icon">{getTypeIcon(doc.doc_type)}</span>
                  <h4>{doc.title}</h4>
                  <span className="doc-type">{getTypeLabel(doc.doc_type)}</span>
                </div>
                <div className="doc-actions">
                  <button 
                    onClick={() => handleEdit(doc)}
                    className="btn btn-small btn-secondary"
                  >
                    Edit
                  </button>
                  <button 
                    onClick={() => handleDelete(doc.id)}
                    className="btn btn-small btn-danger"
                  >
                    Delete
                  </button>
                </div>
              </div>

              {renderDocumentationContent(doc)}

              <div className="doc-footer">
                <span className="doc-author">By {doc.author.username}</span>
                <span className="doc-date">
                  {new Date(doc.created_at).toLocaleDateString()}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      <DocumentationModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        onSave={handleSave}
        projectId={projectId}
        taskId={taskId}
        editDoc={editingDoc}
      />
    </div>
  );
};

export default DocumentationList; 