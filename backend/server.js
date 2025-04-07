import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import { ClerkExpressWithAuth } from "@clerk/clerk-sdk-node";
import { Webhook } from "svix";
import ai_router from "./routes/ai_assistant.js";
import multer from "multer";
import axios from "axios";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5001;

// Configure Multer for file uploads
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// CORS configuration
const corsOptions = {
  origin: [
    "http://localhost:5173", // Vite/React dev server (frontend)
    "http://localhost:5001", // Express server (self-reference, if needed)
    "http://localhost:5000", // Python AI server
  ],
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true,
};
app.use(cors(corsOptions));

// Explicitly define /upload as a public route at the top
app.post("/upload", upload.single("file"), async (req, res) => {
  console.log("Reached explicit /upload route in server.js");
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }
    console.log("Received file:", req.file.originalname);

    const formData = new FormData();
    formData.append("file", req.file.buffer, {
      filename: req.file.originalname,
      contentType: req.file.mimetype,
    });

    const flaskResponse = await axios.post(
      "http://127.0.0.1:5000/upload",
      formData,
      {
        headers: {
          ...formData.getHeaders(),
        },
      }
    );
    console.log("Flask response:", flaskResponse.data);
    res.json(flaskResponse.data);
  } catch (error) {
    console.error("Error in /upload:", {
      status: error.response?.status,
      data: error.response?.data,
      message: error.message,
    });
    res.status(error.response?.status || 500).json({
      error: "File upload failed",
      details: error.response?.data || error.message,
    });
  }
});

// JSON parsing middleware
app.use(express.json());

// Webhook middleware for Clerk
app.use((req, res, next) => {
  if (req.path === "/api/webhooks/clerk") {
    express.raw({ type: "application/json" })(req, res, next);
  } else {
    express.json()(req, res, next);
  }
});

// MongoDB Connection
mongoose
  .connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    dbName: "app-db", // Explicitly specify the database name
  })
  .then(() => console.log("MongoDB connected to app-db"))
  .catch((err) => console.error("MongoDB connection error:", err));

// User Schema
const userSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true },
  clerkUserId: String,
  password: String,
  createdAt: { type: Date, default: Date.now },
});

const User = mongoose.model("User", userSchema);

// Document Schema
const documentSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  date: { type: String, required: true },
  folder: { type: String, default: "Uncategorized" },
});
const Document = mongoose.model("Document", documentSchema);

// ToDo Schema
const toDoItemSchema = new mongoose.Schema({
  todoId: { type: String, required: true, unique: true },
  taskDescription: { type: String, required: true },
  isCompleted: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date },
});

const ToDoItem = mongoose.model("ToDoItem", toDoItemSchema);

// Notes Schema (studydb)
const noteSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  clerkUserId: { type: String, required: true }, // Link to the user
  title: { type: String, required: true },
  content: { type: String, required: true },
  date: { type: String, required: true },
});
const Note = mongoose.model("Note", noteSchema);

// Progress Schema (studydb)
const progressSchema = new mongoose.Schema({
  clerkUserId: { type: String, required: true }, // Link to the user
  documents: { type: Number, default: 0 }, // Number of uploaded documents
  completedTodos: { type: Number, default: 0 }, // Number of completed to-dos
  notes: { type: Number, default: 0 }, // Number of notes
  completedPomodoros: { type: Number, default: 0 }, // Number of completed Pomodoros
  events: { type: Number, default: 0 }, // Number of calendar events
  lastActiveDate: { type: Date, default: Date.now }, // Last day of activity for streak
  streak: { type: Number, default: 0 }, // Consecutive days of activity
  updatedAt: { type: Date, default: Date.now }, // Last update timestamp
});

const Progress = mongoose.model("Progress", progressSchema);

// Progress API Routes
// Get progress for a user
app.get("/api/progress/:clerkUserId", async (req, res) => {
  try {
    const { clerkUserId } = req.params;
    let progress = await Progress.findOne({ clerkUserId });
    if (!progress) {
      progress = new Progress({ clerkUserId });
      await progress.save();
    }
    res.json(progress);
  } catch (err) {
    console.error("Error fetching progress:", err);
    res.status(500).json({ message: "Error fetching progress", error: err });
  }
});

// Update progress for a user
app.put("/api/progress/:clerkUserId", async (req, res) => {
  const { clerkUserId } = req.params;
  const { documents, completedTodos, notes, completedPomodoros, events } =
    req.body;

  try {
    let progress = await Progress.findOne({ clerkUserId });
    if (!progress) {
      progress = new Progress({ clerkUserId });
    }

    // Update metrics
    progress.documents = documents || progress.documents;
    progress.completedTodos = completedTodos || progress.completedTodos;
    progress.notes = notes || progress.notes;
    progress.completedPomodoros =
      completedPomodoros || progress.completedPomodoros;
    progress.events = events || progress.events;

    // Update streak
    const today = new Date().toDateString();
    const lastActiveDate = new Date(progress.lastActiveDate).toDateString();
    if (lastActiveDate === today) {
      progress.streak = progress.streak; // No change if same day
    } else if (
      new Date(today) - new Date(lastActiveDate) ===
      24 * 60 * 60 * 1000
    ) {
      progress.streak += 1; // Increment streak if consecutive day
    } else {
      progress.streak = 1; // Reset streak if not consecutive
    }
    progress.lastActiveDate = new Date();

    progress.updatedAt = new Date();
    await progress.save();

    res.json(progress);
  } catch (err) {
    console.error("Error updating progress:", err);
    res.status(500).json({ message: "Error updating progress", error: err });
  }
});

// Events Schema (studydb)
const eventSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  title: { type: String, required: true },
  date: { type: Date, required: true },
});

const Event = mongoose.model("Event", eventSchema);

// Events API Routes
app.get("/api/events", async (req, res) => {
  try {
    const events = await Event.find();
    res.json(events);
  } catch (err) {
    console.error("Error fetching events:", err);
    res.status(500).json({ message: "Error fetching events", error: err });
  }
});

app.post("/api/events", async (req, res) => {
  const { id, title, date } = req.body;
  try {
    const newEvent = new Event({ id, title, date });
    await newEvent.save();
    res.status(201).json(newEvent);
  } catch (err) {
    console.error("Error saving event:", err);
    res.status(500).json({ message: "Error saving event", error: err });
  }
});

app.delete("/api/events/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const deletedEvent = await Event.findOneAndDelete({ id });
    if (!deletedEvent) {
      return res.status(404).json({ message: "Event not found" });
    }
    res.json({ message: "Event deleted", id });
  } catch (err) {
    console.error("Error deleting event:", err);
    res.status(500).json({ message: "Error deleting event", error: err });
  }
});

// Notes API Routes
// Get all notes for a user
app.get("/api/notes/:clerkUserId", async (req, res) => {
  try {
    const { clerkUserId } = req.params;
    const notes = await Note.find({ clerkUserId });
    res.json(notes);
  } catch (err) {
    console.error("Error fetching notes:", err);
    res.status(500).json({ message: "Error fetching notes", error: err });
  }
});

// Add a new note
app.post("/api/notes", async (req, res) => {
  const { id, clerkUserId, title, content } = req.body;
  try {
    const newNote = new Note({
      id,
      clerkUserId,
      title,
      content,
      date: new Date().toISOString().split("T")[0],
    });
    await newNote.save();
    res.status(201).json(newNote);
  } catch (err) {
    console.error("Error saving note:", err);
    res.status(500).json({ message: "Error saving note", error: err });
  }
});

// Delete a note
app.delete("/api/notes/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const deletedNote = await Note.findOneAndDelete({ id });
    if (!deletedNote) {
      return res.status(404).json({ message: "Note not found" });
    }
    res.json({ message: "Note deleted", id });
  } catch (err) {
    console.error("Error deleting note:", err);
    res.status(500).json({ message: "Error deleting note", error: err });
  }
});

// API to save user with Clerk authentication
app.post(
  "/api/users",
  ClerkExpressWithAuth({
    publishableKey: process.env.CLERK_PUBLISHABLE_KEY,
    secretKey: process.env.CLERK_SECRET_KEY,
  }),
  async (req, res) => {
    const { name, email } = req.body;
    console.log("Received user data from request body:", { name, email });

    if (!req.auth?.userId) {
      return res.status(401).json({ error: "Unauthorized - Please sign in" });
    }

    try {
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        console.log("User already exists:", existingUser);
        return res.status(200).json(existingUser);
      }

      const user = new User({
        name,
        email,
        clerkUserId: req.auth.userId,
        password: "clerk-authenticated",
      });
      const savedUser = await user.save();
      console.log("User saved successfully:", savedUser);
      res.status(201).json(savedUser);
    } catch (error) {
      console.error("Backend error saving user:", error);
      res.status(500).json({ error: "Server error" });
    }
  }
);

// Document API Routes
// Get all documents
app.get("/api/documents", async (req, res) => {
  try {
    const { folder } = req.query; // Get folder from query parameter
    const query = folder ? { folder } : {};
    const documents = await Document.find(query);
    res.json(documents);
  } catch (err) {
    console.error("Error fetching documents:", err);
    res.status(500).json({ message: "Error fetching documents", error: err });
  }
});

// Add a new document
app.post("/api/documents", async (req, res) => {
  const { id, name, date, folder } = req.body; // Include folder in the request body
  try {
    const newDocument = new Document({ id, name, date, folder });
    await newDocument.save();
    res.status(201).json(newDocument);
  } catch (err) {
    console.error("Error saving document:", err);
    res.status(500).json({ message: "Error saving document", error: err });
  }
});

// Delete a document
app.delete("/api/documents/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const deletedDoc = await Document.findOneAndDelete({ id });
    if (!deletedDoc) {
      return res.status(404).json({ message: "Document not found" });
    }
    res.json({ message: "Document deleted", id });
  } catch (err) {
    console.error("Error deleting document:", err);
    res.status(500).json({ message: "Error deleting document", error: err });
  }
});

// Get all to-do items
app.get("/api/todos", async (req, res) => {
  try {
    const todos = await ToDoItem.find();
    res.json(todos);
  } catch (err) {
    console.error("Error fetching todos:", err);
    res.status(500).json({ message: "Error fetching todos", error: err });
  }
});

// Add a new to-do item
app.post("/api/todos", async (req, res) => {
  const { todoId, taskDescription } = req.body;
  try {
    const newTodo = new ToDoItem({
      todoId: todoId || Date.now().toString(), // Use provided ID or generate one
      taskDescription,
      isCompleted: false,
    });
    await newTodo.save();
    res.status(201).json(newTodo);
  } catch (err) {
    console.error("Error saving todo:", err);
    res.status(500).json({ message: "Error saving todo", error: err });
  }
});

// Update a to-do item (toggle completion)
app.put("/api/todos/:todoId", async (req, res) => {
  const { todoId } = req.params;
  const { isCompleted } = req.body;
  try {
    const updatedTodo = await ToDoItem.findOneAndUpdate(
      { todoId },
      { isCompleted, updatedAt: Date.now() },
      { new: true }
    );
    if (!updatedTodo) {
      return res.status(404).json({ message: "To-do item not found" });
    }
    res.json(updatedTodo);
  } catch (err) {
    console.error("Error updating todo:", err);
    res.status(500).json({ message: "Error updating todo", error: err });
  }
});

// Delete a to-do item
app.delete("/api/todos/:todoId", async (req, res) => {
  const { todoId } = req.params;
  try {
    const deletedTodo = await ToDoItem.findOneAndDelete({ todoId });
    if (!deletedTodo) {
      return res.status(404).json({ message: "To-do item not found" });
    }
    res.json({ message: "To-do item deleted", todoId });
  } catch (err) {
    console.error("Error deleting todo:", err);
    res.status(500).json({ message: "Error deleting todo", error: err });
  }
});

// Webhook endpoint for Clerk events
app.post("/api/webhooks/clerk", async (req, res) => {
  const WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET;

  if (!WEBHOOK_SECRET) {
    console.error("CLERK_WEBHOOK_SECRET is not set in .env");
    return res.status(500).json({ error: "Server configuration error" });
  }

  const svix_id = req.headers["svix-id"];
  const svix_timestamp = req.headers["svix-timestamp"];
  const svix_signature = req.headers["svix-signature"];

  if (!svix_id || !svix_timestamp || !svix_signature) {
    console.error("Missing Svix headers");
    return res.status(400).json({ error: "Missing Svix headers" });
  }

  const webhook = new Webhook(WEBHOOK_SECRET);
  let event;
  try {
    console.log("Raw body:", req.body.toString());
    event = webhook.verify(req.body, {
      "svix-id": svix_id,
      "svix-timestamp": svix_timestamp,
      "svix-signature": svix_signature,
    });
    console.log("Webhook verified successfully:", event);
  } catch (error) {
    console.error("Webhook verification failed:", error.message);
    return res.status(400).json({ error: "Invalid webhook signature" });
  }

  switch (event.type) {
    case "user.updated":
      console.log("User updated event received:", event.data);
      try {
        const updatedUser = await User.findOneAndUpdate(
          { clerkUserId: event.data.id },
          {
            name:
              event.data.username ||
              `${event.data.first_name} ${event.data.last_name}` ||
              "Unknown",
            email: event.data.email_addresses[0]?.email_address || "",
          },
          { new: true }
        );
        if (!updatedUser) {
          console.log("User not found for update:", event.data.id);
          return res.status(404).json({ error: "User not found" });
        }
        console.log("User updated in database:", updatedUser);
        res.status(200).json({ message: "User updated successfully" });
      } catch (error) {
        console.error("Error updating user:", error);
        res.status(500).json({ error: "Server error" });
      }
      break;

    case "user.deleted":
      console.log("User deleted event received:", event.data);
      try {
        const deletedUser = await User.findOneAndDelete({
          clerkUserId: event.data.id,
        });
        if (!deletedUser) {
          console.log("User not found for deletion:", event.data.id);
          return res.status(404).json({ error: "User not found" });
        }
        console.log("User deleted from database:", deletedUser);
        res.status(200).json({ message: "User deleted successfully" });
      } catch (error) {
        console.error("Error deleting user:", error);
        res.status(500).json({ error: "Server error" });
      }
      break;

    default:
      console.log("Unhandled event type:", event.type);
      res.status(200).json({ message: "Webhook received, no action taken" });
  }
});

app.get("/", (req, res) => {
  res.status(200).json({ message: "Server is running!" });
});

// Mount ai_router for other routes
//app.use("/", ai_router);

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
