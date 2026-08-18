import express from 'express';
import { addSleep, getDailySleep, getWeeklySleep, resetToday, clearHistory, deleteEntry } from '../controllers/sleepController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.route('/')
  .post(protect, addSleep)
  .get(protect, getDailySleep);

router.get('/weekly', protect, getWeeklySleep);
router.delete('/today', protect, resetToday);
router.delete('/clear', protect, clearHistory);
router.delete('/:id', protect, deleteEntry);

export default router;
