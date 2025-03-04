import React from "react";
import { usePrivy } from "@privy-io/react-auth";

const Logout = () => {
  const { logout } = usePrivy();

  return (
    <button onClick={logout} className="logout-button">
      Log Out
    </button>
  );
};

export default Logout;
