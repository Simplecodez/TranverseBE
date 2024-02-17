// notificationRoute.js
import express from 'express';
import { protect } from '../controllers/authController.js';
import { getNotifications } from '../controllers/notificationController.js';

const router = express.Router();

router.use(protect);
router.get('/', getNotifications);

export default router;
