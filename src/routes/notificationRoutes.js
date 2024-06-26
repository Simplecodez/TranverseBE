// notificationRoute.js
import express from 'express';
import { protect } from '../features/auth/controller/authController.js';
import { getNotifications, createNotificationFE, markAsRead } from '../controllers/notificationController.js';

const router = express.Router();

router.use(protect);
router.route('/').get(getNotifications).post(createNotificationFE);
router.get('/:id', markAsRead);

export default router;
