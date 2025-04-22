import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { fileStore } from "./UploadDocuments"; // Adjust path as needed

const FileView = () => {
  const { id } = useParams(); // Get the file ID from the route
  const navigate = useNavigate();
  const [fileUrl, setFileUrl] = useState(null);

  useEffect(() => {
    const file = fileStore.get(Number(id) || id); // Convert id to number if needed
    if (file) {
      const url = URL.createObjectURL(file);
      setFileUrl(url);
      return () => {
        URL.revokeObjectURL(url);
      };
    }
  }, [id]);

  if (!fileUrl) {
    return (
      <div className="upload-container">
        <h2>No file available to display</h2>
        <button
          className="preview-close-button"
          onClick={() => navigate("/upload-documents")}
        >
          Back to Documents
        </button>
      </div>
    );
  }

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100vw",
        height: "100vh",
        margin: 0,
        padding: 0,
        backgroundColor: "#000", // Optional: black background for immersion
        zIndex: 1000, // Ensure it’s above other elements
        display: "flex",
        flexDirection: "column",
      }}
    >
      <iframe
        src={fileUrl}
        title="File Preview"
        style={{
          width: "100%",
          height: "calc(100% - 60px)", // Leave space for the button
          border: "none",
          backgroundColor: "#fff",
        }}
      />
      <button
        className="preview-close-button"
        onClick={() => navigate("/upload-documents")}
        style={{
          position: "fixed",
          bottom: "10px",
          left: "50%",
          transform: "translateX(-50%)",
          padding: "10px 20px",
          zIndex: 1001, // Above the iframe
        }}
      >
        Back to Documents
      </button>
    </div>
  );
};

export default FileView;
