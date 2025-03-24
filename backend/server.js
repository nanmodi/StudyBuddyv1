import express from 'express';
import cors from 'cors';
import ai_router from './routes/ai_assistant.js';

const app = express();
app.use(cors());
app.use(express.json());

app.use('/', ai_router);

const PORT = process.env.PORT || 8000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
