import express from 'express';
import {
  signup,
  signin,
  activateAccount,
  signout,
  forgotPassword,
  resetPassword,
  getMe,
  protect
} from '../controllers/authController.js';

const router = express.Router();

router.post('/signup', signup);
router.post('/activate', activateAccount);
router.post('/signin', signin);
router.get('/signout', signout);
router.post('/forgotPassword', forgotPassword);
router.patch('/resetPassword/:token', resetPassword);
router.use(protect)
router.get('/me', getMe);


export default router;
