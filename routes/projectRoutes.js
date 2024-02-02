import express from 'express';
import { protect, restrictTo } from '../controllers/authController.js';
import {
        getAll,
        createProject, 
        acceptProject, 
        updateProjectStatus,
        deleteProject,        
        getOne
       } from '../controllers/projectController.js';

const router = express.Router();
router.use(protect);
router.route('/').get(getAll).post(createProject);
router.route('/:id').get(getOne).
        patch(updateProjectStatus).
        delete(restrictTo('user'), deleteProject)
router.get('/accept', acceptProject);


export default router;
