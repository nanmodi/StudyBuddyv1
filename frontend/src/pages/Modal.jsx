import React, { useState, useEffect } from "react";
import { FaUpload } from "react-icons/fa";

const Modal = ({
  isOpen,
  onClose,
  onUpload,
  folders,
  selectedFolder,
  setSelectedFolder,
}) => {
  const [files, setFiles] = useState([]);
  const [isDragging, setIsDragging] = useState(false);
  const [status, setStatus] = useState("");

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const droppedFiles = Array.from(e.dataTransfer.files);
    setFiles((prev) => [...prev, ...droppedFiles]);
  };

  const handleFileChange = (e) => {
    const selectedFiles = Array.from(e.target.files);
    setFiles((prev) => [...prev, ...selectedFiles]);
  };

  const handleUpload = async () => {
    if (files.length === 0) {
      setStatus("Please select at least one file to upload.");
      return;
    }

    setStatus("Uploading...");
    try {
      await onUpload(files);
      setStatus("Upload successful!");
      setFiles([]);
      setTimeout(() => {
        setStatus("");
        onClose();
      }, 1500);
    } catch (err) {
      setStatus("Upload failed. Please try again.");
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <button
          className="modal-close-button"
          onClick={onClose}
          aria-label="Close Modal"
        >
          &times;
        </button>
        <h2 className="modal-title">Upload Documents</h2>

        {/* Folder Selection Dropdown */}
        <div className="folder-select-section">
          <label htmlFor="folder-select" className="folder-select-label">
            Select Folder:
          </label>
          <select
            id="folder-select"
            value={selectedFolder}
            onChange={(e) => setSelectedFolder(e.target.value)}
            className="folder-select"
          >
            {folders.map((folder) => (
              <option key={folder} value={folder}>
                {folder}
              </option>
            ))}
          </select>
        </div>

        <div
          className={`modal-dropzone ${isDragging ? "dragging" : ""}`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => document.getElementById("file-input").click()}
        >
          <FaUpload className="modal-upload-icon" />
          <p className="modal-instruction">
            Drag & drop your files here or click to select
          </p>
          <p className="modal-filetypes">Supported: PDF, DOCX, TXT</p>
          <input
            id="file-input"
            type="file"
            multiple
            onChange={handleFileChange}
            className="hidden-file-input"
          />
        </div>

        {files.length > 0 && (
          <div className="modal-file-list">
            <h3>Selected Files:</h3>
            {files.map((file, index) => (
              <p key={index} className="modal-file-item">
                {file.name}
              </p>
            ))}
          </div>
        )}

        <button
          onClick={handleUpload}
          className="modal-upload-button"
          disabled={files.length === 0}
        >
          Upload Files
        </button>

        {status && <p className="modal-status">{status}</p>}
      </div>
    </div>
  );
};

export default Modal;
