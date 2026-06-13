import express from 'express';
import { searchFood, getMealSuggestions } from '../controllers/nutritionController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.get('/search', protect, searchFood);
router.get('/suggestions', protect, getMealSuggestions);

export default router;
