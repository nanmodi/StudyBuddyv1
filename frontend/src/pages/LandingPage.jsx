import React from "react";
import { useNavigate } from "react-router-dom";

const LandingPage = () => {
  const navigate = useNavigate();

  const handleGetStarted = () => {
    navigate("/upload-documents");
  };

  return (
    <div className="landing-container">
      <h1 className="landing-title">Welcome to StudyBuddy!</h1>
      <button className="login-button" onClick={handleGetStarted}>
        Get Started!
      </button>
    </div>
  );
};

export default LandingPage;
