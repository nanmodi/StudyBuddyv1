import React from "react";
import { useAuth, UserButton } from "@clerk/clerk-react";

const Navbar = () => {
  const { isSignedIn, signOut } = useAuth();

  if (!isSignedIn) return null;

  return (
    <nav className="navbar">
      <div className="nav-content">
        {/* Profile option via UserButton, no afterSignOutUrl needed */}
        <UserButton />
        <button onClick={signOut} className="logout-button">
          Log Out
        </button>
      </div>
    </nav>
  );
};

export default Navbar;
