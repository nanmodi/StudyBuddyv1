import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import App from "./App";
import { PrivyProvider } from "@privy-io/react-auth";

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    <PrivyProvider appId="cm6xq6ysp01ohqie3usbg58ii">
      <App />
    </PrivyProvider>
  </React.StrictMode>
);
