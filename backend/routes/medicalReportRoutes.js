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
    const allowedMimeTypes = ['application/pdf', 'image/png', 'image/jpeg', 'image/jpg'];
    if (allowedMimeTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Only PDF or image reports (PNG, JPG, JPEG) are allowed!'), false);
    }
  }
});

// Route definitions
router.post('/upload', protect, (req, res, next) => {
  console.log('--- Incoming Medical Report Upload ---');
  console.log('Headers:', req.headers);
  upload.single('file')(req, res, (err) => {
    if (err instanceof multer.MulterError) {
      console.error('Multer Upload Error:', err);
      return res.status(400).json({ message: `Multer upload error: ${err.message}` });
    } else if (err) {
      console.error('File Validation Error:', err);
      return res.status(400).json({ message: err.message });
    }
    console.log('Multer parsed file successfully. req.file:', req.file ? {
      originalname: req.file.originalname,
      mimetype: req.file.mimetype,
      size: req.file.size
    } : 'undefined');
    next();
  });
}, uploadReport);
router.get('/', protect, getReports);
router.get('/:id', protect, getReportById);
router.delete('/:id', protect, deleteReport);

export default router;
