import { Router } from 'express';
import multer from 'multer';
import { protect } from '../middlewares/auth.middleware.js';
import * as docsController from '../controllers/docs.controller.js';
import { AppError } from '../utils/AppError.js';

const upload = multer({
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (_req, file, cb) => {
    if (file.mimetype === 'application/pdf') {
      cb(null, true);
    } else {
      cb(new AppError('Only PDF files are allowed (max 5MB).', 400), false);
    }
  },
});

const router = Router();

router.use(protect);

router.post('/analyze', upload.single('document'), docsController.analyzeDocument);

export default router;
