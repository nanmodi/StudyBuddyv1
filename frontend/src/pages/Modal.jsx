// Modal.jsx
import React, { useState, useRef } from "react";
import { FaFolderOpen } from "react-icons/fa"; // Minimalistic folder icon (outline)

const Modal = ({ isOpen, onClose, onUpload }) => {
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [uploadStatus, setUploadStatus] = useState("");
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef(null);

  if (!isOpen) return null;

  const handleFileChange = (event) => {
    const files = Array.from(event.target.files);
    setSelectedFiles(files);
    setUploadStatus(`${files.length} file(s) selected`);
  };

  const handleDrop = (event) => {
    event.preventDefault();
    setIsDragging(false);
    const files = Array.from(event.dataTransfer.files);
    setSelectedFiles(files);
    setUploadStatus(`${files.length} file(s) dropped`);
  };

  const handleDragOver = (event) => {
    event.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleBrowseClick = () => {
    fileInputRef.current.click();
  };

  const handleUpload = () => {
    if (selectedFiles.length === 0) {
      setUploadStatus("Please select files first");
      return;
    }

    setUploadStatus("Uploading...");
    setTimeout(() => {
      setUploadStatus("Files uploaded successfully!");
      onUpload(selectedFiles);
      setSelectedFiles([]);
      setUploadStatus("");
    }, 2000);
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <button className="modal-close-button" onClick={onClose}>
          ✕
        </button>
        <h2 className="modal-title">Upload Files</h2>

        <div className="modal-upload-section">
          <div
            className={`modal-dropzone ${isDragging ? "dragging" : ""}`}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onClick={handleBrowseClick}
          >
            <FaFolderOpen className="modal-upload-icon" />
            <p className="modal-instruction">
              Browse or drag and drop files here
            </p>
            <p className="modal-filetypes">PDF, DOC, DOCX, TXT</p>
            <input
              type="file"
              multiple
              onChange={handleFileChange}
              ref={fileInputRef}
              className="hidden-file-input"
              accept=".pdf,.doc,.docx,.txt"
            />
          </div>

          {selectedFiles.length > 0 && (
            <div className="modal-file-list">
              <h3>Selected Files:</h3>
              <ul>
                {selectedFiles.map((file, index) => (
                  <li key={index} className="modal-file-item">
                    {file.name}
                  </li>
                ))}
              </ul>
            </div>
          )}

          <button
            onClick={handleUpload}
            className="modal-upload-button"
            disabled={selectedFiles.length === 0}
          >
            Upload Files
          </button>

          {uploadStatus && <p className="modal-status">{uploadStatus}</p>}
        </div>
      </div>
    </div>
  );
};

export default Modal;
