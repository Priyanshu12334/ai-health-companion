import express from 'express';
import { onboardUser, updateSettings } from '../controllers/userController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.post('/onboard', protect, onboardUser);
router.put('/settings', protect, updateSettings);

export default router;
