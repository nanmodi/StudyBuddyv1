import React from "react";
import { useAuth, UserButton } from "@clerk/clerk-react";
import { FaCalendar, FaCheck } from "react-icons/fa";

const Navbar = () => {
  const { isSignedIn, signOut } = useAuth();

  // Function to handle smooth scrolling
  const scrollToSection = (sectionId) => {
    const section = document.getElementById(sectionId);
    if (section) {
      section.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  if (!isSignedIn) return null;

  return (
    <nav className="navbar">
      <div className="nav-links">
        <button
          className="nav-link"
          onClick={() => scrollToSection("calendar-section")}
        >
          <FaCalendar className="nav-icon" />
          Calendar
        </button>
        <button
          className="nav-link"
          onClick={() => scrollToSection("todo-section")}
        >
          <FaCheck className="nav-icon" />
          To-Do
        </button>
      </div>
      <div className="nav-content">
        <UserButton />
        <button onClick={signOut} className="logout-button">
          Log Out
        </button>
      </div>
    </nav>
  );
};

export default Navbar;
