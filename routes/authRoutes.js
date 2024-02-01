import express from 'express';
import {
  signup,
  signin,
  activateAccount,
  signout,
  forgotPassword,
  resetPassword
} from '../controllers/authController.js';

const router = express.Router();

router.post('/signup', signup);
router.post('/activate', activateAccount);
router.post('/signin', signin);
router.post('/signout', signout);
router.post('/forgotPassword', forgotPassword);
router.patch('/resetPassword/:token', resetPassword);


export default router;
