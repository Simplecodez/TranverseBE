import express from 'express';
import { protect, restrictTo } from '../../auth/controller/authController.js';
import createProject from '../controller/create-project.js';
import getAll from '../controller/get-all-projects.js';
import acceptProject from '../controller/accept-project.js';
import declineProject from '../controller/decline-project.js';
import getTask from '../controller/get-tasks.js';
import assignTasks from '../controller/assign-task.js';
import updateProjectStatus from '../controller/update-project-status.js';
import updateProjectTeamMembers from '../controller/update-project-member.js';
import deleteProject from '../controller/delete-project.js';
import getOne from '../controller/get-one-project.js';
import updateTaskStatus from '../controller/update-task-status.js';

const router = express.Router();
router.use(protect);
router.route('/').get(getAll).post(createProject);
router.get('/accept', acceptProject);
router.get('/decline', declineProject);
router.get('/tasks', getTask);
router.patch('/:id/assignTask', assignTasks);
router.post('/:id/addMember', updateProjectTeamMembers);
router.post('/:id/update-task-status', updateTaskStatus);

router.route('/:id').get(getOne).patch(updateProjectStatus).delete(restrictTo('user'), deleteProject);

export default router;
