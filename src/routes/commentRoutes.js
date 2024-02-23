import express from 'express';
import CommentController from '../controllers/CommentController.js';
import Comment from '../models/commentModel.js';
import { protect } from '../features/auth/controller/authController.js';

class CommentRoutes {
  constructor() {
    this.router = express.Router();
    this.commentController = new CommentController(Comment);
  }

  initRoutes() {
    this.router.use(protect);
    this.router
      .route('/:id')
      .post(this.commentController.create())
      .get(this.commentController.get());

    return this.router;
  }
}

export default new CommentRoutes();
