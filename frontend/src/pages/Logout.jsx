import React from "react";
import { useAuth } from "@clerk/clerk-react"; // Import Clerk's useAuth hook

const Logout = () => {
  const { signOut } = useAuth(); // Use Clerk's signOut function instead of logout

  return (
    <button onClick={signOut} className="logout-button">
      Log Out
    </button>
  );
};

export default Logout;
