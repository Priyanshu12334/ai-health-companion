import express from 'express';
import { addMood, getDailyMood, getMoodHistory, deleteEntry, clearHistory } from '../controllers/moodController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.route('/')
  .post(protect, addMood)
  .get(protect, getDailyMood);

router.get('/history', protect, getMoodHistory);
router.delete('/clear', protect, clearHistory);
router.delete('/:id', protect, deleteEntry);

export default router;
