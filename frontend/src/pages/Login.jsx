import React from "react";
import { SignIn } from "@clerk/clerk-react";

const Login = () => {
  return (
    <div className="login-container">
      <SignIn />
    </div>
  );
};

export default Login;
