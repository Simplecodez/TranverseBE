import express from 'express';
import {
  getCalenderData,
  getOne,
  newCalender
} from '../controllers/calenderController.js';
import { protect } from '../features/auth/controller/authController.js';

const router = express.Router();

router.use(protect);
router.route('/').get(getCalenderData).post(newCalender);
router.route('/:id').get(getOne);

export default router;
