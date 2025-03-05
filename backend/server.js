const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const dotenv = require("dotenv");
const { ClerkExpressWithAuth, clerkClient } = require("@clerk/clerk-sdk-node");
const { Webhook } = require("svix");

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5001;

// Middleware
app.use(
  cors({
    origin: "http://localhost:5173", // Your frontend URL
  })
);
app.use(express.json());
app.use(express.raw({ type: "application/json" })); // For webhook raw body parsing

// MongoDB Connection
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.error("MongoDB connection error:", err));

// User Schema (Updated with clerkUserId)
const userSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true },
  clerkUserId: String, // Added to sync with Clerk user ID
  password: String, // Optional, as Clerk handles auth
  createdAt: { type: Date, default: Date.now },
});

const User = mongoose.model("User", userSchema);

// API to save user
app.post("/api/users", ClerkExpressWithAuth(), async (req, res) => {
  const authHeader = req.headers.authorization;
  console.log("Authorization Header:", authHeader);

  const { name, email } = req.body;
  console.log("Received user data from request body:", { name, email });

  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      console.log("User already exists:", existingUser);
      return res.status(200).json(existingUser);
    }

    const user = new User({
      name,
      email,
      clerkUserId: req.auth.userId, // Store Clerk user ID
      password: "clerk-authenticated",
    });
    const savedUser = await user.save();
    console.log("User saved successfully:", savedUser);
    res.status(201).json(savedUser);
  } catch (error) {
    console.error("Backend error saving user:", error);
    res.status(500).json({ error: "Server error" });
  }
});

// Webhook endpoint for Clerk events
app.post("/api/webhooks/clerk", async (req, res) => {
  const WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET;

  if (!WEBHOOK_SECRET) {
    console.error("CLERK_WEBHOOK_SECRET is not set in .env");
    return res.status(500).json({ error: "Server configuration error" });
  }

  console.log("Webhook raw body:", req.body.toString());
  console.log("Webhook headers:", req.headers);

  const svix_id = req.headers["svix-id"];
  const svix_timestamp = req.headers["svix-timestamp"];
  const svix_signature = req.headers["svix-signature"];

  if (!svix_id || !svix_timestamp || !svix_signature) {
    console.error("Missing Svix headers");
    return res.status(400).json({ error: "Missing Svix headers" });
  }

  const webhook = new Webhook(WEBHOOK_SECRET);

  try {
    const payload = webhook.verify(req.body, {
      "svix-id": svix_id,
      "svix-timestamp": svix_timestamp,
      "svix-signature": svix_signature,
    });

    console.log("Webhook payload:", payload);

    if (payload.type === "user.deleted") {
      const userId = payload.data.id;
      console.log("User deleted event received for userId:", userId);

      const deletedUser = await User.findOneAndDelete({ clerkUserId: userId });
      if (!deletedUser) {
        console.log("User not found in MongoDB for clerkUserId:", userId);
      } else {
        console.log("User deleted from MongoDB:", deletedUser);
      }

      return res
        .status(200)
        .json({ message: "Webhook processed successfully" });
    }

    res.status(200).json({ message: "Webhook received, no action taken" });
  } catch (error) {
    console.error("Webhook verification error:", error);
    return res.status(400).json({ error: "Invalid webhook signature" });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
