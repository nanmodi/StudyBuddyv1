import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaTrash, FaPlus, FaCheck, FaRobot, FaSatellite } from "react-icons/fa";
import { documentStore } from "../pages/UploadDocuments"; // Adjust path
import CalendarSection from "../components/CalenderSection"; // Adjust path

const Dashboard = () => {
  const navigate = useNavigate();
  const [recentUploads, setRecentUploads] = useState([]);
  const [affirmation, setAffirmation] = useState("");
  const [todos, setTodos] = useState([]);
  const [newTodo, setNewTodo] = useState("");
  const studyProgress = { completed: 65 };

  const affirmations = [
    "You’re capable of amazing things—keep pushing forward!",
    "Every step you take brings you closer to your goals.",
    "Believe in yourself; you’ve got this!",
    "Your hard work is paying off—stay the course.",
    "You are stronger than you think—keep shining!",
    "Success is built one determined step at a time.",
    "Your potential is limitless—embrace it!",
    "Today is a new opportunity to achieve greatness.",
    "You’re making progress, even if it’s one small win at a time.",
    "The best is yet to come—keep going!",
  ];

  useEffect(() => {
    const fetchDocuments = async () => {
      try {
        const response = await fetch("http://localhost:5001/api/documents");
        if (!response.ok)
          throw new Error(`HTTP error! Status: ${response.status}`);
        const documents = await response.json();
        setRecentUploads(documents);
        documents.forEach((doc) => documentStore.set(doc.id, doc));
      } catch (err) {
        console.error("Error fetching documents:", err.message);
      }
    };
    fetchDocuments();

    const randomIndex = Math.floor(Math.random() * affirmations.length);
    setAffirmation(affirmations[randomIndex]);
  }, []);

  const handleUploadRedirect = () => navigate("/upload-documents");
  const handleAiAppRedirect = () => navigate("/ai");
  const handleFileView = (id) => navigate(`/file/${id}`);

  const handleDelete = async (id) => {
    try {
      const response = await fetch(
        `http://localhost:5001/api/documents/${id}`,
        {
          method: "DELETE",
        }
      );
      if (!response.ok)
        throw new Error(`HTTP error! Status: ${response.status}`);
      documentStore.delete(id);
      setRecentUploads((prev) => prev.filter((doc) => doc.id !== id));
    } catch (err) {
      console.error("Error deleting document:", err.message);
    }
  };
  const addTodo = async () => {
    if (newTodo.trim()) {
      try {
        const response = await fetch("http://localhost:5001/api/todos", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ taskDescription: newTodo }),
        });
        if (!response.ok)
          throw new Error(`HTTP error! Status: ${response.status}`);
        const newTodoItem = await response.json();
        setTodos((prev) => [...prev, newTodoItem]);
        setNewTodo("");
      } catch (err) {
        console.error("Error adding todo:", err.message);
      }
    }
  };

  const toggleTodo = async (todoId, currentStatus) => {
    try {
      const response = await fetch(
        `http://localhost:5001/api/todos/${todoId}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ isCompleted: !currentStatus }),
        }
      );
      if (!response.ok)
        throw new Error(`HTTP error! Status: ${response.status}`);
      const updatedTodo = await response.json();
      setTodos((prev) =>
        prev.map((todo) => (todo.todoId === todoId ? updatedTodo : todo))
      );
    } catch (err) {
      console.error("Error toggling todo:", err.message);
    }
  };

  const deleteTodo = async (todoId) => {
    try {
      const response = await fetch(
        `http://localhost:5001/api/todos/${todoId}`,
        {
          method: "DELETE",
        }
      );
      if (!response.ok)
        throw new Error(`HTTP error! Status: ${response.status}`);
      setTodos((prev) => prev.filter((todo) => todo.todoId !== todoId));
    } catch (err) {
      console.error("Error deleting todo:", err.message);
    }
  };

  return (
    <div className="dashboard-page">
      {/* Affirmation Header */}
      <header className="dashboard-header">
        <div className="affirmation-banner">
          <p className="affirmation-text">“{affirmation}”</p>
        </div>
      </header>

      <div className="dashboard-container">
        {/* Sidebar */}
        <aside className="dashboard-sidebar">
          {/* Recent Uploads */}
          <div className="dashboard-card uploads-card">
            <h2 className="card-title">Recent Uploads</h2>
            {recentUploads.length > 0 ? (
              <ul className="uploads-list">
                {recentUploads.map((upload) => (
                  <li key={upload.id} className="upload-item">
                    <span
                      className="upload-name"
                      onClick={() => handleFileView(upload.id)}
                    >
                      {upload.name}
                    </span>
                    <div className="upload-actions">
                      <span className="upload-date">
                        {upload.date || "N/A"}
                      </span>
                      <button
                        className="delete-button"
                        onClick={() => handleDelete(upload.id)}
                        aria-label="Delete Document"
                      >
                        <FaTrash />
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="no-files-text">No files to display</p>
            )}
            <button className="action-button" onClick={handleUploadRedirect}>
              Upload More
            </button>
          </div>

          {/* AI Doubt Solver Section */}
          <div className="dashboard-card ai-tools-card">
            <h2 className="card-title">Chat with AI Doubt Solver</h2>
            <p className="ai-tools-text">
              Solve all your doubts with our AI-powered assistant. Ask
              questions!
            </p>
            <button
              className="action-button ai-tools-button"
              onClick={handleAiAppRedirect}
            >
              <FaSatellite className="ai-tools-icon" /> Try StudyHelper
            </button>
          </div>

          {/* To-Do List */}
          <div className="dashboard-card todo-card" id="todo-section">
            <h2 className="card-title">To-Do List</h2>
            <div className="todo-input">
              <input
                type="text"
                value={newTodo}
                onChange={(e) => setNewTodo(e.target.value)}
                placeholder="Add a new task..."
                className="todo-input-field"
                onKeyPress={(e) => e.key === "Enter" && addTodo()}
              />
              <button className="add-todo-button" onClick={addTodo}>
                <FaPlus />
              </button>
            </div>
            <ul className="todo-list">
              {todos.map((todo) => (
                <li key={todo.todoId} className="todo-item">
                  <button
                    className={`todo-check ${
                      todo.isCompleted ? "completed" : ""
                    }`}
                    onClick={() => toggleTodo(todo.todoId, todo.isCompleted)}
                  >
                    <FaCheck />
                  </button>
                  <span
                    className={`todo-text ${
                      todo.isCompleted ? "completed" : ""
                    }`}
                  >
                    {todo.taskDescription}
                  </span>
                  <button
                    className="delete-button"
                    onClick={() => deleteTodo(todo.todoId)}
                  >
                    <FaTrash />
                  </button>
                </li>
              ))}
            </ul>
            {todos.length === 0 && (
              <p className="no-todos-text">No tasks yet—add one!</p>
            )}
          </div>
        </aside>

        {/* Main Content */}
        <main className="dashboard-main">
          {/* Study Progress */}
          <div className="dashboard-card progress-card">
            <h2 className="card-title">Study Progress</h2>
            <div className="progress-circle">
              <svg className="progress-ring" width="120" height="120">
                <circle
                  className="progress-ring__background"
                  cx="60"
                  cy="60"
                  r="54"
                  strokeWidth="12"
                />
                <circle
                  className="progress-ring__fill"
                  cx="60"
                  cy="60"
                  r="54"
                  strokeWidth="12"
                  strokeDasharray="339.292"
                  strokeDashoffset={
                    339.292 * (1 - studyProgress.completed / 100)
                  }
                />
              </svg>
              <span className="progress-percentage">
                {studyProgress.completed}%
              </span>
            </div>
            <p className="progress-text">
              You’re making great progress—keep it up!
            </p>
          </div>

          {/* AI Tools Section */}
          <div className="dashboard-card ai-tools-card">
            <h2 className="card-title">Enhance Your Learning</h2>
            <p className="ai-tools-text">
              Use our AI-powered tools to generate flashcards, summaries, and
              more from your documents.
            </p>
            <button
              className="action-button ai-tools-button"
              onClick={handleAiAppRedirect}
            >
              <FaRobot className="ai-tools-icon" /> Use StudyBuddy AI
            </button>
          </div>
          {/* Calendar Section */}
          <CalendarSection />
        </main>
      </div>
    </div>
  );
};

export default Dashboard;
