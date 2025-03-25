import React, { useEffect } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { useUser, useAuth } from "@clerk/clerk-react"; // Import useAuth
import Login from "./pages/Login";
import LandingPage from "./pages/LandingPage";
import Navbar from "./components/Navbar";
import UploadDocuments from "./pages/UploadDocuments";
import FileView from "./pages/FileView";
import Aiapp from "./components/Aiapp";
import PricingPlan from "./pages/PricingPlan";
import Dashboard from "./pages/Dashboard";

const App = () => {
  const { isSignedIn, user } = useUser();
  const { getToken } = useAuth(); // Use useAuth to get the token

  useEffect(() => {
    const saveUserToDatabase = async () => {
      if (!isSignedIn || !user) {
        console.log("User not signed in or user object not available yet");
        return;
      }

      console.log("User object:", user);
      const email = user.emailAddresses[0]?.emailAddress;
      const name =
        user.username || `${user.firstName} ${user.lastName}` || "Unknown";

      if (!email) {
        console.error("No email found in user object");
        return;
      }

      console.log("Data to be sent:", { name, email });

      try {
        const token = await getToken(); // Fetch token using useAuth
        if (!token) {
          throw new Error("No token available");
        }

        const response = await fetch("http://localhost:5001/api/users", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ name, email }),
        });

        if (!response.ok) {
          throw new Error(`Failed to save user: ${response.statusText}`);
        }

        const savedUser = await response.json();
        console.log("User saved to database:", savedUser);
      } catch (error) {
        console.error("Error saving user to database:", error);
      }
    };

    saveUserToDatabase();
  }, [isSignedIn, user, getToken]); // Add getToken to dependency array

  console.log("isSignedIn:", isSignedIn);
  console.log("User:", user);

  return (
    <Router>
      <Navbar />
      <Routes>
        <Route
          path="/"
          element={isSignedIn ? <Navigate to="/landing" /> : <Login />}
        />
        <Route path="/landing" element={<LandingPage />} />
        <Route
          path="/upload-documents"
          element={isSignedIn ? <UploadDocuments /> : <Navigate to="/" />}
        />
        <Route
          path="/file/:id"
          element={isSignedIn ? <FileView /> : <Navigate to="/" />}
        />
        <Route path="/ai" element={<Aiapp />} />
        <Route
          path="/pricing"
          element={isSignedIn ? <PricingPlan /> : <Navigate to="/" />}
        />
        <Route
          path="/dashboard"
          element={isSignedIn ? <Dashboard /> : <Navigate to="/" />}
        />
      </Routes>
    </Router>
  );
};

export default App;
