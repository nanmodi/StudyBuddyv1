import React, { useState, useEffect } from "react";
import {
  FaFolderOpen,
  FaTrash,
  FaPlus,
  FaFolder,
  FaChevronDown,
  FaChevronRight,
  FaPen,
} from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import Modal from "./Modal";

export const fileStore = new Map();
export const documentStore = new Map();

const UploadDocuments = () => {
  const [folders, setFolders] = useState([]);
  const [documentsByFolder, setDocumentsByFolder] = useState({});
  const [expandedFolders, setExpandedFolders] = useState({});
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [isCreateFolderModalOpen, setIsCreateFolderModalOpen] = useState(false);
  const [newFolderName, setNewFolderName] = useState("");
  const [selectedFolder, setSelectedFolder] = useState("Uncategorized");
  const navigate = useNavigate();

  // Fetch documents from MongoDB on mount
  useEffect(() => {
    const fetchDocuments = async () => {
      try {
        const response = await fetch("http://localhost:5001/api/documents");
        const documents = await response.json();

        const organizedDocs = {};
        const folderSet = new Set(["Uncategorized"]);

        documents.forEach((doc) => {
          const folder = doc.folder || "Uncategorized";
          if (!organizedDocs[folder]) {
            organizedDocs[folder] = [];
          }
          organizedDocs[folder].push(doc);
          folderSet.add(folder);
          documentStore.set(doc.id, doc);
        });

        setDocumentsByFolder(organizedDocs);
        setFolders([...folderSet]);
        const initialExpanded = {};
        [...folderSet].forEach((folder) => {
          initialExpanded[folder] = false;
        });
        setExpandedFolders(initialExpanded);
      } catch (err) {
        console.error("Error fetching documents:", err);
      }
    };
    fetchDocuments();
  }, []);

  const handleOpenUploadModal = () => setIsUploadModalOpen(true);
  const handleCloseUploadModal = () => setIsUploadModalOpen(false);

  const handleOpenCreateFolderModal = () => setIsCreateFolderModalOpen(true);
  const handleCloseCreateFolderModal = () => {
    setIsCreateFolderModalOpen(false);
    setNewFolderName("");
  };

  const handleCreateFolder = () => {
    if (newFolderName.trim() === "") {
      alert("Folder name cannot be empty");
      return;
    }
    if (folders.includes(newFolderName.trim())) {
      alert("Folder already exists");
      return;
    }

    const newFolders = [...folders, newFolderName.trim()];
    setFolders(newFolders);
    setDocumentsByFolder((prev) => ({
      ...prev,
      [newFolderName.trim()]: [],
    }));
    setExpandedFolders((prev) => ({
      ...prev,
      [newFolderName.trim()]: false,
    }));
    handleCloseCreateFolderModal();
  };

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
        folder: selectedFolder,
      };
      documentStore.set(id, doc);
      return doc;
    });

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

    setDocumentsByFolder((prev) => ({
      ...prev,
      [selectedFolder]: [...(prev[selectedFolder] || []), ...newDocuments],
    }));
  };

  const handleFileClick = (doc) => navigate(`/file/${doc.id}`);

  const handleDelete = async (id, folder) => {
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
      setDocumentsByFolder((prev) => ({
        ...prev,
        [folder]: prev[folder].filter((doc) => doc.id !== id),
      }));
    } catch (err) {
      console.error("Error deleting document:", err);
    }
  };

  const toggleFolder = (folder) => {
    setExpandedFolders((prev) => ({
      ...prev,
      [folder]: !prev[folder],
    }));
  };

  const handleGoToNotes = () => {
    navigate("/notes");
  };

  return (
    <div className="upload-container">
      <div className="upload-header">
        <h1 className="upload-title">Your Study Documents</h1>
        <div className="upload-actions">
          <button
            onClick={handleGoToNotes}
            className="notes-button"
            aria-label="Go to Notes"
          >
            <FaPen className="pen-icon" /> Go to Notes
          </button>
          <button
            onClick={handleOpenCreateFolderModal}
            className="create-folder-button"
            aria-label="Create Folder"
          >
            <FaFolder className="folder-icon" /> Create Folder
          </button>
          <button
            onClick={handleOpenUploadModal}
            className="upload-files-button"
            aria-label="Upload Files"
          >
            <FaPlus className="plus-icon" /> Upload New Files
          </button>
        </div>
      </div>

      {folders.length > 0 ? (
        <div className="folder-board">
          {folders.map((folder) => (
            <div key={folder} className="folder-section">
              <div
                className="folder-header"
                onClick={() => toggleFolder(folder)}
              >
                <div className="folder-title-container">
                  {expandedFolders[folder] ? (
                    <FaChevronDown className="folder-chevron" />
                  ) : (
                    <FaChevronRight className="folder-chevron" />
                  )}
                  <FaFolder className="folder-icon" />
                  <h2 className="folder-title">{folder}</h2>
                </div>
                <span className="folder-count">
                  {documentsByFolder[folder]?.length || 0} files
                </span>
              </div>
              {expandedFolders[folder] && (
                <div className="folder-documents">
                  {documentsByFolder[folder]?.length > 0 ? (
                    <div className="kanban-column">
                      {documentsByFolder[folder].map((doc) => (
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
                            onClick={() => handleDelete(doc.id, folder)}
                            aria-label="Delete Document"
                          >
                            <FaTrash />
                          </button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="no-files-text">No files in this folder</p>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="no-files-container">
          <p className="no-files-text">No folders created yet</p>
        </div>
      )}

      <Modal
        isOpen={isUploadModalOpen}
        onClose={handleCloseUploadModal}
        onUpload={handleUpload}
        folders={folders}
        selectedFolder={selectedFolder}
        setSelectedFolder={setSelectedFolder}
      />

      {isCreateFolderModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <button
              className="modal-close-button"
              onClick={handleCloseCreateFolderModal}
              aria-label="Close Modal"
            >
              ×
            </button>
            <h2 className="modal-title">Create New Folder</h2>
            <input
              type="text"
              value={newFolderName}
              onChange={(e) => setNewFolderName(e.target.value)}
              placeholder="Enter folder name (e.g., Mathematics)"
              className="folder-input"
            />
            <button
              onClick={handleCreateFolder}
              className="modal-upload-button"
            >
              Create Folder
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default UploadDocuments;
