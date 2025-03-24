import express from 'express';
import axios from 'axios';
import multer from 'multer';

const ai_router = express.Router();
const FLASK_SERVER = 'http://127.0.0.1:5000'; // Change to your Flask server URL

// Configure Multer for handling file uploads
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// Upload PDF & process embeddings
ai_router.post("/upload", upload.single("file"), async (req, res) => {
  try {
      if (!req.file) {
          return res.status(400).json({ error: "No file uploaded" });
      }

      console.log("Received file:", req.file.originalname);

      // Convert `Buffer` to a `ReadableStream`
      const formData = new FormData();
      formData.append("file", req.file.buffer, {
          filename: req.file.originalname,
          contentType: req.file.mimetype,
      });

      const flaskResponse = await axios.post("http://127.0.0.1:8000/upload", formData, {
          headers: {
              ...formData.getHeaders(),
          },
      });

      res.json(flaskResponse.data);
  } catch (error) {
      console.error("Error forwarding file:", error);
      res.status(500).json({ error: "File upload failed" });
  }
});

// Generate Summary
ai_router.post('/summary', async (req, res) => {
    try {
        const response = await axios.post(`${FLASK_SERVER}/summary`);
        res.json(response.data);
    } catch (error) {
        console.error('Summary Error:', error);
        res.status(500).json({ error: 'Failed to generate summary' });
    }
});

// Generate Flashcards
ai_router.post('/flashcards', async (req, res) => {
    try {
       console.log('Flash')
        const response = await axios.post(`${FLASK_SERVER}/flashcards`);
        
        res.json(response.data);
    } catch (error) {
        console.error('Flashcard Error:', error);
        res.status(500).json({ error: 'Failed to generate flashcards' });
    }
});



export default ai_router;
