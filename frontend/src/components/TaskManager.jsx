import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { Plus, Edit2, Trash2, Calendar, Clock } from "lucide-react";
import toast from "react-hot-toast";

const TaskManager = () => {
  const [tasks, setTasks] = useState([]);
  const [editingTask, setEditingTask] = useState(null);
  const token = localStorage.getItem("token");

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
    setValue,
  } = useForm();

  const fetchTasks = async () => {
    try {
      if (!token) {
        toast.error("No authentication token found");
        return;
      }

      const res = await fetch("http://localhost:8000/api/tasks/", {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        credentials: 'include'
      });

      if (res.status === 401) {
        toast.error("Session expired. Please login again");
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/';
        return;
      }

      if (!res.ok) {
        throw new Error('Failed to fetch tasks');
      }

      const data = await res.json();
      setTasks(data);
    } catch (error) {
      toast.error("Failed to fetch tasks: " + error.message);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  const onSubmit = async (data) => {
    try {
      if (!token) {
        toast.error("No authentication token found");
        return;
      }

      const url = editingTask
        ? `http://localhost:8000/api/tasks/${editingTask.id}/`
        : "http://localhost:8000/api/tasks/";

      const response = await fetch(url, {
        method: editingTask ? "PUT" : "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          title: data.title,
          description: data.description,
          effort_days: parseInt(data.effortDays),
          due_date: data.dueDate
        })
      });

      if (response.status === 401) {
        toast.error("Authentication failed. Please login again.");
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        window.location.href = "/";
        return;
      }

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || "Failed to save task");
      }

      const result = await response.json();
      toast.success(editingTask ? "Task updated!" : "Task created!");
      fetchTasks();
      reset();
      setEditingTask(null);
    } catch (error) {
      toast.error(error.message);
    }
  };

  const handleEdit = (task) => {
    setEditingTask(task);
    setValue("title", task.title);
    setValue("description", task.description);
    setValue("effortDays", task.effortDays);
    // Format date using native JavaScript
    const date = new Date(task.dueDate);
    const formattedDate = date.toISOString().split("T")[0];
    setValue("dueDate", formattedDate);
  };

  const handleDelete = async (taskId) => {
    if (window.confirm("Are you sure you want to delete this task?")) {
      try {
        const res = await fetch(`http://localhost:8000/api/tasks/${taskId}/`, {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (res.ok) {
          toast.success("Task deleted!");
          fetchTasks();
        } else {
          const errorData = await res.json();
          toast.error(errorData.error || "Failed to delete task");
        }
      } catch (error) {
        toast.error("Failed to delete task");
      }
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-4">
      <form onSubmit={handleSubmit(onSubmit)} className="bg-white p-6 rounded-lg shadow-md mb-8">
        <h2 className="text-2xl font-bold mb-4">{editingTask ? 'Edit Task' : 'Create Task'}</h2>
        
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div>
            <label className="block text-sm font-medium text-gray-700">Title</label>
            <input
              {...register('title', { required: 'Title is required' })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            />
            {errors.title && <p className="mt-1 text-sm text-red-600">{errors.title.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Effort (Days)</label>
            <input
              type="number"
              {...register('effortDays', { 
                required: 'Effort days is required',
                min: { value: 1, message: 'Minimum effort is 1 day' }
              })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            />
            {errors.effortDays && <p className="mt-1 text-sm text-red-600">{errors.effortDays.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Due Date</label>
            <input
              type="date"
              {...register('dueDate', { required: 'Due date is required' })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            />
            {errors.dueDate && <p className="mt-1 text-sm text-red-600">{errors.dueDate.message}</p>}
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700">Description</label>
            <textarea
              {...register('description', { required: 'Description is required' })}
              rows="3"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            />
            {errors.description && <p className="mt-1 text-sm text-red-600">{errors.description.message}</p>}
          </div>
        </div>

        <div className="mt-4 flex justify-end space-x-3">
          {editingTask && (
            <button
              type="button"
              onClick={() => {
                setEditingTask(null);
                reset();
              }}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
            >
              Cancel
            </button>
          )}
          <button
            type="submit"
            className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            {editingTask ? 'Update Task' : 'Create Task'}
          </button>
        </div>
      </form>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {tasks.map((task) => (
          <div key={task.id} className="bg-white p-6 rounded-lg shadow-md">
            <div className="flex justify-between items-start">
              <h3 className="text-lg font-semibold">{task.title}</h3>
              <div className="flex space-x-2">
                <button
                  onClick={() => handleEdit(task)}
                  className="text-blue-600 hover:text-blue-800"
                >
                  <Edit2 className="w-5 h-5" />
                </button>
                <button
                  onClick={() => handleDelete(task.id)}
                  className="text-red-600 hover:text-red-800"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
                </div>
            </div>
            <p className="mt-2 text-gray-600">{task.description}</p>
            <div className="mt-4 flex items-center space-x-4 text-sm text-gray-500">
              <div className="flex items-center">
                <Clock className="w-4 h-4 mr-1" />
                {task.effort_days} days
              </div>
              <div className="flex items-center">
                <Calendar className="w-4 h-4 mr-1" />
                {new Date(task.due_date).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "short",
                  day: "2-digit",
                })}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};


export default TaskManager;