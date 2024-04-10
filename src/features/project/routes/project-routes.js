import express from 'express';
import { protect, restrictTo } from '../../auth/controller/authController.js';
import createProject from '../controller/create-project.js';
import getAll from '../controller/get-all-projects.js';
import acceptProject from '../controller/accept-project.js';
import declineProject from '../controller/decline-project.js';
import getTask from '../controller/get-tasks.js';
import assignTasks from '../controller/assign-task.js';
import updateProjectStatus from '../controller/update-project-details.js';
import updateProjectTeamMembers from '../controller/add-team-member.js';
import deleteProject from '../controller/delete-project.js';
import getOne from '../controller/get-one-project.js';
import updateTaskStatus from '../controller/update-task-status.js';
import updateProjecDetails from '../controller/update-tasks-details.js';
import updateProjectStatusAndDescription from '../controller/update-project-details.js';
import { saveFileToDB, uploadFile } from '../controller/upload-project-file.js';
import streamFile from '../controller/streamFile.js';

const router = express.Router();

router.use(protect);
router.route('/').get(getAll).post(createProject);
router.get('/accept', acceptProject);
router.get('/decline', declineProject);
router.get('/tasks', getTask);
router.patch('/:id/assignTask', assignTasks);
router.post('/:id/addMember', updateProjectTeamMembers);
router.patch('/:id/update-task-status', updateTaskStatus);
router.patch('/:id/update-task-details', updateProjecDetails);
router.patch('/:id/uploadFile', uploadFile, saveFileToDB);
router.get('/:id/streamFile', streamFile);

router.route('/:id').get(getOne).patch(updateProjectStatusAndDescription).delete(restrictTo('user'), deleteProject);

export default router;
