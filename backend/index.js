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
import medicalReportRoutes from './routes/medicalReportRoutes.js';
import nutritionRoutes from './routes/nutritionRoutes.js';

dotenv.config();

const app = express();

// Connect to database
connectDB();

// Middleware
app.use(
  cors({
    origin: true,
    credentials: true,
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
app.use('/api/medical-reports', medicalReportRoutes);
app.use('/api/nutrition', nutritionRoutes);


// Health Check Endpoint for monitoring UptimeRobot service
app.all('/api/health', (req, res) => {
  res.status(200).json({
    status: 'online',
    message: 'Wellora backend is running',
  });
});


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
