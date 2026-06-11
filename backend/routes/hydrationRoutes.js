import express from 'express';
import { addHydration, getDailyHydration, getWeeklyHydration, resetToday, clearHistory } from '../controllers/hydrationController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.route('/')
  .post(protect, addHydration)
  .get(protect, getDailyHydration);

router.get('/weekly', protect, getWeeklyHydration);
router.delete('/today', protect, resetToday);
router.delete('/clear', protect, clearHistory);

export default router;
