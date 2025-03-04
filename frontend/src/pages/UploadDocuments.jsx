import React, { useState, useEffect } from "react";
import { FaFolderOpen } from "react-icons/fa";
import { FaPlus } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import Modal from "./Modal";

// Shared stores for files and document metadata
export const fileStore = new Map();
export const documentStore = new Map(); // New store for document metadata

const UploadDocuments = () => {
  const [uploadedDocuments, setUploadedDocuments] = useState([]);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const navigate = useNavigate();

  // Restore documents from documentStore on mount
  useEffect(() => {
    if (documentStore.size > 0 && uploadedDocuments.length === 0) {
      const restoredDocuments = Array.from(documentStore.values());
      setUploadedDocuments(restoredDocuments);
    }
  }, []);

  const handleOpenUploadModal = () => {
    setIsUploadModalOpen(true);
  };

  const handleCloseUploadModal = () => {
    setIsUploadModalOpen(false);
  };

  const handleUpload = (files) => {
    if (!files || files.length === 0) {
      console.error("No files provided for upload");
      return;
    }
    const newDocuments = files.map((file) => {
      const id = Date.now() + Math.random();
      fileStore.set(id, file); // Store the File object
      const doc = {
        id,
        name: file.name,
        status: "Uploaded",
      };
      documentStore.set(id, doc); // Store the metadata
      return doc;
    });
    setUploadedDocuments((prev) => [...prev, ...newDocuments]);
  };

  const handleFileClick = (doc) => {
    navigate(`/file/${doc.id}`);
  };

  return (
    <div className="upload-container">
      <div className="upload-card">
        <button
          onClick={handleOpenUploadModal}
          className="upload-files-button"
          aria-label="Upload Files"
        >
          <FaPlus className="plus-icon" /> Upload Files
        </button>
      </div>

      {uploadedDocuments.length > 0 && (
        <div className="kanban-board">
          <h2 className="kanban-title">Study Documents</h2>
          <div className="kanban-column">
            {uploadedDocuments.map((doc) => (
              <div
                key={doc.id}
                className="kanban-card"
                onClick={() => handleFileClick(doc)}
              >
                <FaFolderOpen className="kanban-icon" />
                <span className="kanban-file-name">{doc.name}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      <Modal
        isOpen={isUploadModalOpen}
        onClose={handleCloseUploadModal}
        onUpload={handleUpload}
      />
    </div>
  );
};

export default UploadDocuments;
