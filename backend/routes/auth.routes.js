// routes/auth.routes.js
import { Router } from 'express';
import { protect } from '../middlewares/auth.middleware.js';
import { validate } from '../middlewares/validate.middleware.js';
import {
  signup, signupValidation,
  login,  loginValidation,
  getMe,  updateProfile,
} from '../controllers/auth.controller.js';

const router = Router();

router.post('/signup', signupValidation, validate, signup);
router.post('/login',  loginValidation,  validate, login);
router.get('/me',      protect, getMe);
router.patch('/me',    protect, updateProfile);

export default router;
