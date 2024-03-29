import express from 'express';
import { userSearch } from '../controllers/userController.js';
import { protect } from '../features/auth/controller/authController.js';

const router = express.Router();
router.use(protect);
router.post('/search', userSearch);

export default router;
