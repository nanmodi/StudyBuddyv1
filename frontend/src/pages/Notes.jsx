import React, { useState, useEffect } from "react";
import { FaPlus, FaTrash, FaEdit } from "react-icons/fa";
import { useAuth } from "@clerk/clerk-react";

const Notes = () => {
  const { userId: clerkUserId } = useAuth();
  const [notes, setNotes] = useState([]);
  const [newNote, setNewNote] = useState({ title: "", content: "" });
  const [editingNote, setEditingNote] = useState(null);

  // Fetch notes on mount
  useEffect(() => {
    if (!clerkUserId) return;

    const fetchNotes = async () => {
      try {
        const response = await fetch(
          `http://localhost:5001/api/notes/${clerkUserId}`
        );
        const data = await response.json();
        setNotes(data);
      } catch (err) {
        console.error("Error fetching notes:", err);
      }
    };
    fetchNotes();
  }, [clerkUserId]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewNote((prev) => ({ ...prev, [name]: value }));
  };

  const handleAddOrUpdateNote = async (e) => {
    e.preventDefault();
    if (!clerkUserId) {
      alert("Please sign in to add notes.");
      return;
    }

    const noteData = {
      id: Date.now() + Math.random(),
      clerkUserId,
      title: newNote.title,
      content: newNote.content,
      date: new Date().toISOString().split("T")[0],
    };

    try {
      const response = await fetch("http://localhost:5001/api/notes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(noteData),
      });
      const savedNote = await response.json();
      if (editingNote) {
        setNotes((prev) =>
          prev.map((note) => (note.id === editingNote.id ? savedNote : note))
        );
        setEditingNote(null);
      } else {
        setNotes((prev) => [...prev, savedNote]);
      }
      setNewNote({ title: "", content: "" });
    } catch (err) {
      console.error("Error saving note:", err);
    }
  };

  const handleEditNote = (note) => {
    setEditingNote(note);
    setNewNote({ title: note.title, content: note.content });
  };

  const handleDeleteNote = async (id) => {
    try {
      const response = await fetch(`http://localhost:5001/api/notes/${id}`, {
        method: "DELETE",
      });
      if (response.ok) {
        setNotes((prev) => prev.filter((note) => note.id !== id));
      }
    } catch (err) {
      console.error("Error deleting note:", err);
    }
  };

  return (
    <div className="notes-container">
      <div className="notes-header">
        <h1 className="notes-title">Your Notes</h1>
      </div>
      <div className="notes-content">
        <form onSubmit={handleAddOrUpdateNote} className="notes-form">
          <input
            type="text"
            name="title"
            value={newNote.title}
            onChange={handleInputChange}
            placeholder="Note Title"
            className="notes-input"
            required
          />
          <textarea
            name="content"
            value={newNote.content}
            onChange={handleInputChange}
            placeholder="Write your note here..."
            className="notes-textarea"
            required
          />
          <button
            type="submit"
            className="notes-button"
            aria-label={editingNote ? "Update Note" : "Add Note"}
          >
            <FaPlus className="plus-icon" />
            {editingNote ? "Update Note" : "Add Note"}
          </button>
          {editingNote && (
            <button
              type="button"
              onClick={() => {
                setEditingNote(null);
                setNewNote({ title: "", content: "" });
              }}
              className="notes-cancel-button"
              aria-label="Cancel Edit"
            >
              Cancel
            </button>
          )}
        </form>
        {notes.length > 0 ? (
          <div className="notes-list">
            {notes.map((note) => (
              <div key={note.id} className="note-card">
                <div className="note-content">
                  <h2 className="note-title">{note.title}</h2>
                  <p className="note-text">{note.content}</p>
                  <span className="note-date">{note.date}</span>
                </div>
                <div className="note-actions">
                  <button
                    onClick={() => handleEditNote(note)}
                    className="edit-button"
                    aria-label="Edit Note"
                  >
                    <FaEdit />
                  </button>
                  <button
                    onClick={() => handleDeleteNote(note.id)}
                    className="delete-button"
                    aria-label="Delete Note"
                  >
                    <FaTrash />
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="no-notes-container">
            <p className="no-notes-text">No notes created yet</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Notes;
