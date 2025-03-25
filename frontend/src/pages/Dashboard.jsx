import React from "react";
import { useNavigate } from "react-router-dom";

const Dashboard = () => {
  const navigate = useNavigate();

  // Mock data for demonstration (replace with real data from your backend)
  const recentUploads = [
    { id: 1, name: "Physics Notes.pdf", date: "2025-03-23" },
    { id: 2, name: "Chemistry Chapter 1.docx", date: "2025-03-22" },
  ];
  const studyProgress = { completed: 65 }; // Percentage
  const affirmation = "You’re capable of amazing things—keep pushing forward!";

  const handleUploadRedirect = () => navigate("/upload-documents");
  const handleAiAppRedirect = () => navigate("/ai");
  const handleFileView = (id) => navigate(`/file/${id}`);

  return (
    <div className="dashboard-page">
      <section className="dashboard-section">
        <h1 className="dashboard-title">Welcome Back to StudyBuddy</h1>
        <p className="dashboard-subtitle">
          Your personalized hub for smarter studying.
        </p>

        {/* Grid Layout */}
        <div className="dashboard-grid">
          {/* Recent Uploads */}
          <div className="dashboard-card uploads-card">
            <h2 className="card-title">Recent Uploads</h2>
            <ul className="uploads-list">
              {recentUploads.map((upload) => (
                <li
                  key={upload.id}
                  className="upload-item"
                  onClick={() => handleFileView(upload.id)}
                >
                  <span className="upload-name">{upload.name}</span>
                  <span className="upload-date">{upload.date}</span>
                </li>
              ))}
            </ul>
            <button className="action-button" onClick={handleUploadRedirect}>
              Upload More
            </button>
          </div>

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

          {/* Affirmation */}
          <div className="dashboard-card affirmation-card">
            <h2 className="card-title">Daily Affirmation</h2>
            <p className="affirmation-text">“{affirmation}”</p>
          </div>

          {/* Quick Actions */}
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
