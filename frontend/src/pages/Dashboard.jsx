import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaTrash } from "react-icons/fa";
import { documentStore } from "../pages/UploadDocuments"; // Adjust path

const Dashboard = () => {
  const navigate = useNavigate();
  const [recentUploads, setRecentUploads] = useState([]);
  const [affirmation, setAffirmation] = useState("");
  const studyProgress = { completed: 65 };

  // List of affirmations
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

  // Fetch documents from MongoDB and set random affirmation on mount
  useEffect(() => {
    const fetchDocuments = async () => {
      try {
        const response = await fetch("http://localhost:5001/api/documents");
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        const documents = await response.json();
        setRecentUploads(documents);
        documents.forEach((doc) => documentStore.set(doc.id, doc));
      } catch (err) {
        console.error("Error fetching documents:", err.message);
      }
    };
    fetchDocuments();

    // Set a random affirmation on each reload
    const randomIndex = Math.floor(Math.random() * affirmations.length);
    setAffirmation(affirmations[randomIndex]);
  }, []); // Empty dependency array ensures this runs only on mount

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

  return (
    <div className="dashboard-page">
      <section className="dashboard-section">
        <h1 className="dashboard-title">Welcome Back to StudyBuddy</h1>
        <p className="dashboard-subtitle">
          Your personalized hub for smarter studying.
        </p>

        <div className="dashboard-grid">
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

          <div className="dashboard-card affirmation-card">
            <h2 className="card-title">Daily Affirmation</h2>
            <div className="affirmation-content">
              <p className="affirmation-text">“{affirmation}”</p>
            </div>
          </div>

          <div className="dashboard-card actions-card">
            <h2 className="card-title">Quick Actions</h2>
            <div className="actions-list">
              <button className="action-button" onClick={handleUploadRedirect}>
                Upload Document
              </button>
              <button className="action-button" onClick={handleAiAppRedirect}>
                Use AI Tools
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Dashboard;
