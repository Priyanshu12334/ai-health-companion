import express from 'express';
import multer from 'multer';
import { uploadReport, getReports, getReportById, deleteReport } from '../controllers/medicalReportController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// Configure multer for memory storage and file validation
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10 MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/pdf') {
      cb(null, true);
    } else {
      cb(new Error('Only PDF reports are allowed!'), false);
    }
  }
});

// Route definitions
router.post('/upload', protect, upload.single('file'), uploadReport);
router.get('/', protect, getReports);
router.get('/:id', protect, getReportById);
router.delete('/:id', protect, deleteReport);

export default router;
