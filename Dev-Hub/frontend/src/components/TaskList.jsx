import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { PencilSquareIcon, TrashIcon } from '@heroicons/react/24/outline';

const TaskList = ({ tasks, selectedProject, onTaskDeleted, onTaskUpdated, onTaskSelect, selectedTask }) => {
  const { token, API_BASE_URL } = useAuth();
  const [editingTask, setEditingTask] = useState(null);
  const [editForm, setEditForm] = useState({});

  // Filter tasks by selected project
  const filteredTasks = selectedProject 
    ? tasks.filter(task => task.project_id === selectedProject.id)
    : tasks;

  const handleEdit = (task) => {
    setEditingTask(task.id);
    setEditForm({
      title: task.title,
      description: task.description,
      status: task.status,
      priority: task.priority
    });
  };

  const handleSave = async (taskId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/tasks/${taskId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(editForm),
      });
      if (response.ok) {
        const updatedTask = await response.json();
        onTaskUpdated(updatedTask);
        setEditingTask(null);
      }
    } catch (error) {
      console.error('Error updating task:', error);
    }
  };

  const handleDelete = async (taskId) => {
    if (!window.confirm('Are you sure you want to delete this task?')) {
      return;
    }
    try {
      const response = await fetch(`${API_BASE_URL}/tasks/${taskId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      if (response.ok) {
        onTaskDeleted(taskId);
      }
    } catch (error) {
      console.error('Error deleting task:', error);
    }
  };

  const handleTaskClick = (task) => {
    if (onTaskSelect) {
      onTaskSelect(task);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed':
        return 'bg-green-900 text-green-300';
      case 'in_progress':
        return 'bg-yellow-900 text-yellow-300';
      default:
        return 'bg-gray-800 text-gray-300';
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high':
        return 'bg-red-900 text-red-300';
      case 'medium':
        return 'bg-yellow-900 text-yellow-300';
      default:
        return 'bg-green-900 text-green-300';
    }
  };

  if (!selectedProject) {
    return (
      <div className="no-tasks">Select a project to view its tasks</div>
    );
  }

  if (filteredTasks.length === 0) {
    return (
      <div className="no-tasks">No tasks found for this project. Create your first task!</div>
    );
  }

  return (
    <div className="task-list">
      {filteredTasks.map((task) => (
        <div
          key={task.id}
          className={`task-card${editingTask === task.id ? ' editing' : ''}${selectedTask?.id === task.id ? ' selected' : ''}`}
          onClick={() => handleTaskClick(task)}
        >
          {editingTask === task.id ? (
            <div className="edit-form">
              <input
                type="text"
                value={editForm.title}
                onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                className="edit-input"
                placeholder="Task title"
              />
              <textarea
                value={editForm.description}
                onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                className="edit-input"
                placeholder="Task description"
                rows="2"
              />
              <div className="edit-actions">
                <select
                  value={editForm.status}
                  onChange={(e) => setEditForm({ ...editForm, status: e.target.value })}
                  className="edit-input"
                >
                  <option value="pending">Pending</option>
                  <option value="in_progress">In Progress</option>
                  <option value="completed">Completed</option>
                </select>
                <select
                  value={editForm.priority}
                  onChange={(e) => setEditForm({ ...editForm, priority: e.target.value })}
                  className="edit-input"
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
                <button
                  onClick={() => handleSave(task.id)}
                  className="primary-btn"
                >
                  Save
                </button>
                <button
                  onClick={() => setEditingTask(null)}
                  className="secondary-btn"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <div className="task-content">
              <div className="task-main">
                <h3 className="task-title">{task.title}</h3>
                {task.description && (
                  <p className="task-desc">{task.description}</p>
                )}
                <div className="task-meta">
                  <span className={`status-badge status-${task.status}`}>{task.status.replace('_', ' ')}</span>
                  <span className={`priority-badge priority-${task.priority}`}>{task.priority}</span>
                </div>
                <p className="task-date">Created: {new Date(task.created_at).toLocaleDateString()}</p>
              </div>
              <div className="task-actions">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleEdit(task);
                  }}
                  className="edit-btn"
                  title="Edit task"
                >
                  <PencilSquareIcon className="icon" />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDelete(task.id);
                  }}
                  className="delete-btn"
                  title="Delete task"
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

export default TaskList; 