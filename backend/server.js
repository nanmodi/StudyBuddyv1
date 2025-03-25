import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import { ClerkExpressWithAuth } from "@clerk/clerk-sdk-node";
import { Webhook } from "svix";
import ai_router from "./routes/ai_assistant.js";
import multer from "multer"; // Added for file upload handling
import axios from "axios"; // Added for forwarding to Flask

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
  .connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB connected"))
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

    // Check if user is authenticated
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

  const webhook = new Webhook(WHOOK_SECRET);
  let event;
  try {
    console.log("Raw body:", req.body.toString()); // Debug: Convert Buffer to string for readability
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
app.use("/", ai_router);

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
