import React from "react";
import { useNavigate } from "react-router-dom";

const PricingPlan = () => {
  const navigate = useNavigate();

  const handleSubscribe = (plan) => {
    // Placeholder for subscription logic; could redirect to a payment page
    console.log(`Subscribed to ${plan} plan`);
    // Example: navigate("/payment", { state: { plan } });
  };

  return (
    <div className="pricing-page">
      <section className="pricing-section">
        <h1 className="pricing-title">Choose Your StudyBuddy Plan</h1>
        <p className="pricing-subtitle">
          Unlock premium features tailored to your learning needs.
        </p>
        <div className="pricing-grid">
          {/* Basic Plan */}
          <div className="pricing-card">
            <h2 className="plan-title">Basic</h2>
            <p className="plan-price">
              ₹499 <span className="plan-duration">/month</span>
            </p>
            <ul className="plan-features">
              <li>Document Processing (5 files/month)</li>
              <li>AI Summaries</li>
              <li>Flashcards (up to 50)</li>
              <li>Email Support</li>
            </ul>
            <button
              className="plan-button"
              onClick={() => handleSubscribe("Basic")}
            >
              Get Started
            </button>
          </div>

          {/* Pro Plan */}
          <div className="pricing-card popular">
            <span className="popular-badge">Most Popular</span>
            <h2 className="plan-title">Pro</h2>
            <p className="plan-price">
              ₹999 <span className="plan-duration">/month</span>
            </p>
            <ul className="plan-features">
              <li>Document Processing (20 files/month)</li>
              <li>AI Summaries</li>
              <li>Unlimited Flashcards</li>
              <li>Study Tracking</li>
              <li>Priority Email Support</li>
            </ul>
            <button
              className="plan-button popular-button"
              onClick={() => handleSubscribe("Pro")}
            >
              Get Started
            </button>
          </div>

          {/* Premium Plan */}
          <div className="pricing-card">
            <h2 className="plan-title">Premium</h2>
            <p className="plan-price">
              ₹1,999 <span className="plan-duration">/month</span>
            </p>
            <ul className="plan-features">
              <li>Unlimited Document Processing</li>
              <li>AI Summaries</li>
              <li>Unlimited Flashcards</li>
              <li>Study Tracking</li>
              <li>Affirmations & Motivations</li>
              <li>Doubt Solver</li>
              <li>24/7 Chat Support</li>
            </ul>
            <button
              className="plan-button"
              onClick={() => handleSubscribe("Premium")}
            >
              Get Started
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default PricingPlan;
