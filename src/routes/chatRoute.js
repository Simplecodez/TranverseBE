// chatRoute.js
import express from 'express';
import { sendChat, getChats } from '../controllers/chatController.js';
import { protect } from '../features/auth/controller/authController.js';

const router = express.Router();

router.use(protect);
router.post('/send', sendChat);
router.get('/getChats', getChats);

export default router;
