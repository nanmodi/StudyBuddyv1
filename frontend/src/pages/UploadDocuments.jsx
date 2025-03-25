import React, { useState, useEffect } from "react";
import { FaFolderOpen, FaTrash, FaPlus } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import Modal from "./Modal";

export const fileStore = new Map();
export const documentStore = new Map();

const UploadDocuments = () => {
  const [uploadedDocuments, setUploadedDocuments] = useState([]);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const navigate = useNavigate();

  // Fetch documents from MongoDB on mount
  useEffect(() => {
    const fetchDocuments = async () => {
      try {
        const response = await fetch("http://localhost:5001/api/documents");
        const documents = await response.json();
        setUploadedDocuments(documents);
        documents.forEach((doc) => documentStore.set(doc.id, doc));
      } catch (err) {
        console.error("Error fetching documents:", err);
      }
    };
    fetchDocuments();
  }, []);

  const handleOpenUploadModal = () => setIsUploadModalOpen(true);
  const handleCloseUploadModal = () => setIsUploadModalOpen(false);

  const handleUpload = async (files) => {
    if (!files || files.length === 0) {
      console.error("No files provided for upload");
      return;
    }
    const newDocuments = files.map((file) => {
      const id = Date.now() + Math.random();
      fileStore.set(id, file);
      const doc = {
        id,
        name: file.name,
        date: new Date().toISOString().split("T")[0],
      };
      documentStore.set(id, doc);
      return doc;
    });

    // Save to MongoDB
    for (const doc of newDocuments) {
      try {
        await fetch("http://localhost:5001/api/documents", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(doc),
        });
      } catch (err) {
        console.error("Error saving document to DB:", err);
      }
    }

    setUploadedDocuments((prev) => [...prev, ...newDocuments]);
  };

  const handleFileClick = (doc) => navigate(`/file/${doc.id}`);

  const handleDelete = async (id) => {
    try {
      const response = await fetch(
        `http://localhost:5001/api/documents/${id}`,
        {
          method: "DELETE",
        }
      );
      if (!response.ok) throw new Error("Failed to delete from DB");

      fileStore.delete(id);
      documentStore.delete(id);
      setUploadedDocuments((prev) => prev.filter((doc) => doc.id !== id));
    } catch (err) {
      console.error("Error deleting document:", err);
    }
  };

  return (
    <div className="upload-container">
      <div className="upload-header">
        <h1 className="upload-title">Your Study Documents</h1>
        <button
          onClick={handleOpenUploadModal}
          className="upload-files-button"
          aria-label="Upload Files"
        >
          <FaPlus className="plus-icon" /> Upload New Files
        </button>
      </div>

      {uploadedDocuments.length > 0 ? (
        <div className="kanban-board">
          <div className="kanban-column">
            {uploadedDocuments.map((doc) => (
              <div key={doc.id} className="kanban-card">
                <div
                  className="kanban-content"
                  onClick={() => handleFileClick(doc)}
                >
                  <FaFolderOpen className="kanban-icon" />
                  <span className="kanban-file-name">{doc.name}</span>
                  <span className="kanban-file-date">{doc.date}</span>
                </div>
                <button
                  className="delete-button"
                  onClick={() => handleDelete(doc.id)}
                  aria-label="Delete Document"
                >
                  <FaTrash />
                </button>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="no-files-container">
          <p className="no-files-text">No files uploaded yet</p>
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
