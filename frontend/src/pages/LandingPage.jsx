import React from "react";
import { useNavigate } from "react-router-dom";

const LandingPage = () => {
  const navigate = useNavigate();

  const handleGetStarted = () => {
    navigate("/upload-documents");
  };

  const handlePricingRedirect = () => {
    navigate("/pricing"); // CTA section button redirects to pricing
  };

  const handleDashboardView = () => {
    navigate("/dashboard"); // Redirect to dashboard for returning users
  };

  return (
    <div className="landing-page">
      {/* Hero Section */}
      <section className="hero-section">
        <h1 className="hero-title">Master Your Studies with StudyBuddy</h1>
        <p className="hero-subtitle">
          Your all-in-one AI-powered companion for smarter learning, motivation,
          and doubt resolution.
        </p>
        <button className="cta-button" onClick={handleDashboardView}>
          Start Learning Now
        </button>
      </section>

      {/* Features Section */}
      <section className="features-section">
        <h2 className="features-title">Everything You Need to Succeed</h2>
        <div className="features-grid">
          <div className="feature-card">
            <div className="feature-icon">📄</div>
            <h3 className="feature-title">Smart Document Processing</h3>
            <p className="feature-text">
              Upload PDFs, DOCX, or TXT files and extract key insights instantly
              with AI.
            </p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">✨</div>
            <h3 className="feature-title">AI-Powered Summaries</h3>
            <p className="feature-text">
              Get concise, accurate summaries to grasp core concepts in minutes.
            </p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">🃏</div>
            <h3 className="feature-title">Interactive Flashcards</h3>
            <p className="feature-text">
              Master your material with tailored flashcards generated from your
              content.
            </p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">⏱️</div>
            <h3 className="feature-title">Study Tracking</h3>
            <p className="feature-text">
              Monitor your progress, set goals, and stay on top of your study
              schedule.
            </p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">🌟</div>
            <h3 className="feature-title">Affirmations & Motivations</h3>
            <p className="feature-text">
              Boost your confidence with daily affirmations and motivational
              quotes.
            </p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">❓</div>
            <h3 className="feature-title">Doubt Solver</h3>
            <p className="feature-text">
              Ask questions and get instant, AI-driven answers to clear your
              doubts.
            </p>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta-section">
        <h2 className="cta-title">Ready to Transform Your Learning Journey?</h2>
        <p className="cta-subtitle">
          Join thousands of students leveling up with StudyBuddy.
        </p>
        <button
          className="cta-button secondary"
          onClick={handlePricingRedirect}
        >
          Get Started Today
        </button>
      </section>
    </div>
  );
};

export default LandingPage;
