import React, { useState, useEffect } from 'react';
import { Pencil, Trash2, Check, X } from 'lucide-react';
import './App.css';

function App() {
  const [tasks, setTasks] = useState([]);
  const [title, setTitle] = useState('');
  const [editingTask, setEditingTask] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch tasks from API
  useEffect(() => {
    const fetchTasks = async () => {
      try {
        setLoading(true);
        const response = await fetch('http://localhost:8000/api/tasks');
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        const data = await response.json();
        setTasks(data);
        setError(null);
      } catch (err) {
        setError(`Failed to fetch tasks: ${err.message}`);
        console.error('Error fetching tasks:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchTasks();
  }, []);

  // Add new task
  const addTask = async (e) => {
    e.preventDefault();
    if (!title.trim()) return;

    try {
      const response = await fetch('http://localhost:8000/api/tasks', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ title }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const newTask = await response.json();
      setTasks([...tasks, newTask]);
      setTitle('');
    } catch (err) {
      setError(`Failed to add task: ${err.message}`);
      console.error('Error adding task:', err);
    }
  };

  // Update task
  const updateTask = async (e) => {
    e.preventDefault();
    if (!title.trim() || !editingTask) return;

    try {
      const response = await fetch(`http://localhost:8000/api/tasks/${editingTask.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          title,
          completed: editingTask.completed
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const updatedTask = await response.json();
      setTasks(tasks.map(task => task.id === editingTask.id ? updatedTask : task));
      setTitle('');
      setEditingTask(null);
    } catch (err) {
      setError(`Failed to update task: ${err.message}`);
      console.error('Error updating task:', err);
    }
  };

  // Delete task
  const deleteTask = async (id) => {
    try {
      const response = await fetch(`http://localhost:8000/api/tasks/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      setTasks(tasks.filter(task => task.id !== id));
    } catch (err) {
      setError(`Failed to delete task: ${err.message}`);
      console.error('Error deleting task:', err);
    }
  };

  // Toggle task completion
  const toggleComplete = async (id, completed) => {
    try {
      const taskToUpdate = tasks.find(task => task.id === id);
      const response = await fetch(`http://localhost:8000/api/tasks/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          title: taskToUpdate.title,
          completed: !completed
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const updatedTask = await response.json();
      setTasks(tasks.map(task => task.id === id ? updatedTask : task));
    } catch (err) {
      setError(`Failed to update task status: ${err.message}`);
      console.error('Error updating task status:', err);
    }
  };

  // Set up task for editing
  const startEditing = (task) => {
    setEditingTask(task);
    setTitle(task.title);
  };

  // Cancel editing
  const cancelEditing = () => {
    setEditingTask(null);
    setTitle('');
  };

  // Filter and sort tasks based on completion status
  const ongoingTasks = tasks
    .filter(task => !task.completed)
    .sort((a, b) => new Date(a.created_at) - new Date(b.created_at)); // Oldest to newest

  const completedTasks = tasks
    .filter(task => task.completed)
    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at)); // Newest to oldest

  // Format the date string
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const day = date.getDate();
    const month = date.toLocaleString('default', { month: 'short' });
    const year = date.getFullYear();
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    
    return `${day} ${month} ${year} ${hours}:${minutes}`;
  };

  return (
    <div className="max-w-2xl mx-auto p-4">
      <h1 className="text-3xl font-bold mb-4">Task Management</h1>
      
      {/* Form for adding/updating tasks */}
      <div className="mb-6">
        <div className="mb-4">
          <label htmlFor="title" className="block text-sm font-medium mb-1">Title</label>
          <input
            type="text"
            id="title"
            className="w-full p-2 border border-gray-300 rounded"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Enter task title"
          />
        </div>
        
        {editingTask ? (
          <div className="flex space-x-2">
            <button
              onClick={updateTask}
              className="bg-orange-400 text-white px-4 py-2 rounded"
            >
              Update Task
            </button>
            <button
              onClick={cancelEditing}
              className="bg-red-500 text-white px-4 py-2 rounded"
            >
              Cancel
            </button>
          </div>
        ) : (
          <button
            onClick={addTask}
            className="bg-blue-400 text-white px-4 py-2 rounded"
          >
            Add Task
          </button>
        )}
      </div>
      
      {/* Display error if present */}
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}
      
      {/* Loading indicator */}
      {loading && <p className="text-gray-500">Loading tasks...</p>}
      
      {/* Ongoing Tasks List */}
      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-2">Ongoing Task</h2>
        {ongoingTasks.length === 0 && !loading ? (
          <p className="text-gray-500">No ongoing tasks</p>
        ) : (
          ongoingTasks.map((task) => (
            <div 
              key={task.id} 
              className="bg-gray-200 p-3 mb-2 rounded flex justify-between items-center"
            >
              <div>
                <div className="flex items-center">
                  <span>{task.title}</span>
                  <button 
                    onClick={() => startEditing(task)}
                    className="ml-2"
                  >
                    <Pencil size={14} />
                  </button>
                </div>
                <div className="text-xs text-gray-600">
                  {formatDate(task.created_at)}
                </div>
              </div>
              <div className="flex space-x-1">
                <button 
                  onClick={() => toggleComplete(task.id, task.completed)}
                  className="p-1 rounded"
                >
                  <Check size={18} />
                </button>
                <button 
                  onClick={() => deleteTask(task.id)}
                  className="p-1 rounded"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
      
      {/* Completed Tasks List */}
      <div>
        <h2 className="text-xl font-semibold mb-2">Completed Task</h2>
        {completedTasks.length === 0 && !loading ? (
          <p className="text-gray-500">No completed tasks</p>
        ) : (
          completedTasks.map((task) => (
            <div 
              key={task.id} 
              className="bg-gray-200 p-3 mb-2 rounded flex justify-between items-center"
            >
              <div>
                <div className="flex items-center">
                  <span>{task.title}</span>
                  <button 
                    onClick={() => startEditing(task)}
                    className="ml-2"
                  >
                    <Pencil size={14} />
                  </button>
                </div>
                <div className="text-xs text-gray-600">
                  {formatDate(task.created_at)}
                </div>
              </div>
              <div className="flex space-x-1">
                <button 
                  onClick={() => toggleComplete(task.id, task.completed)}
                  className="p-1 rounded"
                >
                  <X size={18} />
                </button>
                <button 
                  onClick={() => deleteTask(task.id)}
                  className="p-1 rounded"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default App;

// ARZzz (Achmad Rizky) //