import express from 'express';
import cors from 'cors';
import { errorHandler } from './middlewares/errorHandler.js';

const app = express();

app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get('/api/health', (req, res) => {
  res.json({ 
    success: true, 
    message: 'GymShop API funcionando correctamente',
    timestamp: new Date().toISOString()
  });
});

app.use(errorHandler);

export default app;
