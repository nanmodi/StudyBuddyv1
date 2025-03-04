import React from "react";
import { usePrivy } from "@privy-io/react-auth";

const Login = () => {
  const { login } = usePrivy();

  return (
    <div className="login-container">
      <button onClick={login} className="login-button">
        Log In
      </button>
    </div>
  );
};

export default Login;
