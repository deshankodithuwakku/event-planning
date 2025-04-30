import express from 'express';
import { unifiedLogin, getCurrentUser } from '../controllers/authController.js';
import { authenticate } from '../middleware/authMiddleware.js';

const router = express.Router();

// Authentication routes
router.post('/login', unifiedLogin);
router.get('/me', authenticate, getCurrentUser);

export default router;
