import React from "react";
import { useAuth, UserButton } from "@clerk/clerk-react";
import { Link } from "react-router-dom";

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
        <Link to="/upload-documents" className="nav-link">
          Upload
        </Link>
        <Link to="/pricing" className="nav-link">
          Pricing
        </Link>
        <Link to="/ai" className="nav-link">
          AI tools
        </Link>
        <Link to="/notes" className="nav-link">
          Notes
        </Link>
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
