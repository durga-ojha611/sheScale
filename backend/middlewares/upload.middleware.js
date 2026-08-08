// middlewares/upload.middleware.js — Multer config for document uploads (Feature 1.3)
// Files are stored in memory (Buffer) so the redaction utility runs BEFORE
// any file data or reference touches the database.
import multer from 'multer';
import { AppError } from '../utils/AppError.js';

const ALLOWED_MIME_TYPES = [
  'application/pdf',
  'image/jpeg',
  'image/png',
  'image/webp',
];

const storage = multer.memoryStorage();  // in-memory — redact before DB write

const fileFilter = (_req, file, cb) => {
  if (ALLOWED_MIME_TYPES.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new AppError(`Unsupported file type: ${file.mimetype}. Only PDF, JPEG, PNG, WEBP allowed.`, 400));
  }
};

// Single document upload (document scanner, PDF whisperer)
export const uploadSingle = multer({
  storage,
  fileFilter,
  limits: { fileSize: 20 * 1024 * 1024 },  // 20MB
}).single('document');

// Multiple documents (bulk checklist upload)
export const uploadMultiple = multer({
  storage,
  fileFilter,
  limits: { fileSize: 20 * 1024 * 1024, files: 10 },
}).array('documents', 10);

// Wrap multer in a Promise so it works with asyncHandler
export const handleUpload = (uploadFn) => (req, res, next) => {
  uploadFn(req, res, (err) => {
    if (err instanceof multer.MulterError) {
      return next(new AppError(`Upload error: ${err.message}`, 400));
    }
    if (err) return next(err);
    next();
  });
};
