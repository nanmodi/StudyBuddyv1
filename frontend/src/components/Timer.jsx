import React, { useState, useEffect } from "react";
import { FaPlay, FaPause, FaRedo } from "react-icons/fa";

const Timer = () => {
  const [seconds, setSeconds] = useState(25 * 60); // Default to 25 minutes (Pomodoro)
  const [isActive, setIsActive] = useState(false);

  // Timer logic
  useEffect(() => {
    let interval = null;
    if (isActive && seconds > 0) {
      interval = setInterval(() => {
        setSeconds((prev) => prev - 1);
      }, 1000);
    } else if (seconds === 0) {
      setIsActive(false);
      alert("Pomodoro session complete! Take a break.");
    }
    return () => clearInterval(interval);
  }, [isActive, seconds]);

  const handleStartPause = () => {
    setIsActive(!isActive);
  };

  const handleReset = () => {
    setIsActive(false);
    setSeconds(25 * 60); // Reset to 25 minutes
  };

  // Format time as MM:SS
  const formatTime = (time) => {
    const minutes = Math.floor(time / 60);
    const seconds = time % 60;
    return `${minutes.toString().padStart(2, "0")}:${seconds
      .toString()
      .padStart(2, "0")}`;
  };

  return (
    <div className="dashboard-card timer-card">
      <h2 className="card-title">Study Timer</h2>
      <div className="timer-display">
        <span className="timer-time">{formatTime(seconds)}</span>
      </div>
      <div className="timer-controls">
        <button
          onClick={handleStartPause}
          className="timer-button"
          aria-label={isActive ? "Pause Timer" : "Start Timer"}
        >
          {isActive ? <FaPause /> : <FaPlay />}
        </button>
        <button
          onClick={handleReset}
          className="timer-button"
          aria-label="Reset Timer"
        >
          <FaRedo />
        </button>
      </div>
      <p className="timer-text">
        {isActive ? "Keep focused!" : "Start a Pomodoro session."}
      </p>
    </div>
  );
};

export default Timer;
