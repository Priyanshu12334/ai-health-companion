import express from 'express';
import { chatWithAI, getChatHistory, deleteMessage, clearHistory } from '../controllers/aiController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.post('/chat', protect, chatWithAI);
router.get('/history', protect, getChatHistory);
router.delete('/chat/clear', protect, clearHistory);
router.delete('/chat/:id', protect, deleteMessage);

export default router;
