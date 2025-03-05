// Login.jsx
import React from "react";
import { SignIn } from "@clerk/clerk-react";

const Login = () => {
  return (
    <div className="login-container">
      <SignIn
        appearance={{
          elements: {
            footer: "hidden",
          },
        }}
      />
    </div>
  );
};

export default Login;
