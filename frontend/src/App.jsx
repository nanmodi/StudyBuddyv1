// src/App.jsx
import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { usePrivy } from "@privy-io/react-auth";
import Login from "./pages/Login";
import LandingPage from "./pages/LandingPage";
import Navbar from "./components/Navbar";
import UploadDocuments from "./pages/UploadDocuments";
import FileView from "./pages/FileView";

const App = () => {
  const { authenticated } = usePrivy();

  return (
    <Router>
      <Navbar />
      <Routes>
        <Route
          path="/"
          element={authenticated ? <Navigate to="/landing" /> : <Login />}
        />
        <Route
          path="/landing"
          element={authenticated ? <LandingPage /> : <Navigate to="/" />}
        />
        <Route
          path="/upload-documents"
          element={authenticated ? <UploadDocuments /> : <Navigate to="/" />}
        />
        <Route
          path="/file/:id"
          element={authenticated ? <FileView /> : <Navigate to="/" />}
        />
      </Routes>
    </Router>
  );
};

export default App;
