import express from 'express';
import rateLimit from 'express-rate-limit';
import { chatWithAI, getChatHistory, deleteMessage, clearHistory } from '../controllers/aiController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// Rate limiter for AI chat: 20 requests per 15 minutes per IP
export const aiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20, // 20 requests per 15 minutes
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    message: 'Too many AI requests from this IP, please try again after 15 minutes.'
  }
});

router.post('/chat', protect, aiLimiter, chatWithAI);
router.get('/history', protect, getChatHistory);
router.delete('/chat/clear', protect, clearHistory);
router.delete('/chat/:id', protect, deleteMessage);

export default router;
