import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import ProjectList from '../components/ProjectList';
import TaskList from '../components/TaskList';
import DocumentationList from '../components/DocumentationList';
import CreateProjectModal from '../components/CreateProjectModal';
import CreateTaskModal from '../components/CreateTaskModal';
import ProfileCard from '../components/ProfileCard';
import Sidebar from '../components/Sidebar';

const Projects = () => {
  const { user, token, API_BASE_URL, logout } = useAuth();
  const [projects, setProjects] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateProject, setShowCreateProject] = useState(false);
  const [showCreateTask, setShowCreateTask] = useState(false);
  const [selectedProject, setSelectedProject] = useState(null);
  const [selectedTask, setSelectedTask] = useState(null);
  const [activeTab, setActiveTab] = useState('tasks'); // 'tasks' or 'documentation'

  useEffect(() => {
    fetchProjects();
    fetchTasks();
  }, []);

  const fetchProjects = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/projects/`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      if (response.ok) {
        const data = await response.json();
        setProjects(data);
      }
    } catch (error) {
      console.error('Error fetching projects:', error);
    }
  };

  const fetchTasks = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/tasks/`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      if (response.ok) {
        const data = await response.json();
        setTasks(data);
      }
    } catch (error) {
      console.error('Error fetching tasks:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleProjectCreated = (newProject) => {
    setProjects([...projects, newProject]);
    setShowCreateProject(false);
  };

  const handleTaskCreated = (newTask) => {
    setTasks([...tasks, newTask]);
    setShowCreateTask(false);
  };

  const handleProjectDeleted = (projectId) => {
    setProjects(projects.filter(p => p.id !== projectId));
    setTasks(tasks.filter(t => t.project_id !== projectId));
    if (selectedProject?.id === projectId) {
      setSelectedProject(null);
      setSelectedTask(null);
    }
  };

  const handleTaskDeleted = (taskId) => {
    setTasks(tasks.filter(t => t.id !== taskId));
    if (selectedTask?.id === taskId) {
      setSelectedTask(null);
    }
  };

  const handleProjectUpdated = (updatedProject) => {
    setProjects(projects.map(p => p.id === updatedProject.id ? updatedProject : p));
    if (selectedProject?.id === updatedProject.id) {
      setSelectedProject(updatedProject);
    }
  };

  const handleTaskUpdated = (updatedTask) => {
    setTasks(tasks.map(t => t.id === updatedTask.id ? updatedTask : t));
    if (selectedTask?.id === updatedTask.id) {
      setSelectedTask(updatedTask);
    }
  };

  const handleProjectSelect = (project) => {
    setSelectedProject(project);
    setSelectedTask(null);
    setActiveTab('tasks');
  };

  const handleTaskSelect = (task) => {
    setSelectedTask(task);
    setActiveTab('documentation');
  };

  const filteredTasks = selectedProject 
    ? tasks.filter(task => task.project_id === selectedProject.id)
    : tasks;

  if (loading) {
    return (
      <div className="dashboard-loading">
        <div className="loading-text">Loading...</div>
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      <Sidebar user={user} logout={logout} />
      <main className="main-content">
        <div className="header">
          <div>
            <h1 className="dashboard-title">Projects & Tasks</h1>
            <div className="dashboard-welcome">Welcome, {user?.username}! Today is {new Date().toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</div>
          </div>
          <ProfileCard user={user} />
        </div>
        
        <div className="main-sections">
          <section className="projects-section card">
            <div className="section-header">
              <h2>Projects</h2>
              <button
                onClick={() => setShowCreateProject(true)}
                className="primary-btn"
              >
                New Project
              </button>
            </div>
            <ProjectList
              projects={projects}
              onProjectDeleted={handleProjectDeleted}
              onProjectUpdated={handleProjectUpdated}
              onProjectSelect={handleProjectSelect}
              selectedProject={selectedProject}
            />
            {/* Project Documentation shown when a project is selected */}
            {selectedProject && (
              <div className="project-documentation-inline">
                <DocumentationList projectId={selectedProject.id} />
              </div>
            )}
          </section>
          
          <section className="tasks-section card">
            <div className="section-header">
              <h2>Tasks</h2>
              <button
                onClick={() => setShowCreateTask(true)}
                disabled={!selectedProject}
                className="primary-btn"
              >
                New Task
              </button>
            </div>
            <TaskList
              tasks={filteredTasks}
              selectedProject={selectedProject}
              onTaskDeleted={handleTaskDeleted}
              onTaskUpdated={handleTaskUpdated}
              onTaskSelect={handleTaskSelect}
              selectedTask={selectedTask}
            />
            {/* Task Documentation shown when a task is selected */}
            {selectedTask && (
              <div className="task-documentation-inline">
                <DocumentationList projectId={selectedProject.id} taskId={selectedTask.id} />
              </div>
            )}
          </section>
        </div>

        {/* Modals */}
        {showCreateProject && (
          <CreateProjectModal
            onClose={() => setShowCreateProject(false)}
            onProjectCreated={handleProjectCreated}
          />
        )}
        {showCreateTask && (
          <CreateTaskModal
            onClose={() => setShowCreateTask(false)}
            onTaskCreated={handleTaskCreated}
            projects={projects}
            selectedProject={selectedProject}
          />
        )}
      </main>
    </div>
  );
};

export default Projects; 