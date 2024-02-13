import express from 'express';
import { protect, restrictTo } from '../controllers/authController.js';
import {
  getAll,
  createProject,
  acceptProject,
  updateProjectStatus,
  deleteProject,
  getOne,
  assignTasks,
  updateProjectTeamMembers
} from '../controllers/projectController.js';

const router = express.Router();
router.use(protect);
router.route('/').get(getAll).post(createProject);
router.get('/accept', acceptProject);
router.patch('/:id/assignTask', assignTasks);
router.post('/:id/addMember', updateProjectTeamMembers);
router
  .route('/:id')
  .get(getOne)
  .patch(updateProjectStatus)
  .delete(restrictTo('user'), deleteProject);

export default router;
