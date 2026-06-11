import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import connectDB from './config/db.js';

// Routes
import authRoutes from './routes/authRoutes.js';
import userRoutes from './routes/userRoutes.js';
import hydrationRoutes from './routes/hydrationRoutes.js';
import sleepRoutes from './routes/sleepRoutes.js';
import moodRoutes from './routes/moodRoutes.js';
import aiRoutes from './routes/aiRoutes.js';

dotenv.config();

const app = express();

// Connect to database
connectDB();

// Middleware
app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "https://ai-health-companion-phi.vercel.app"
    ],
    credentials: true,
    methods: ["GET","POST","PUT","DELETE","OPTIONS"],
    allowedHeaders: ["Content-Type","Authorization"]
  })
);
app.use(express.json());

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/user', userRoutes);
app.use('/api/hydration', hydrationRoutes);
app.use('/api/sleep', sleepRoutes);
app.use('/api/mood', moodRoutes);
app.use('/api/ai', aiRoutes);

// Error Handling Middleware
app.use((err, req, res, next) => {
  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  res.status(statusCode).json({
    message: err.message,
    stack: process.env.NODE_ENV === 'production' ? null : err.stack,
  });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
