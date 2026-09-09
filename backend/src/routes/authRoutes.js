import { Router } from 'express';
import { register, login, getMe, logout } from '../controllers/authController.js';
import { protect } from '../middleware/auth.js';
import { authValidation, loginValidation, validate } from '../middleware/validation.js';

const router = Router();
router.post('/register', authValidation, validate, register);
router.post('/login', loginValidation, validate, login);
router.get('/me', protect, getMe);
router.post('/logout', protect, logout);

export default router;