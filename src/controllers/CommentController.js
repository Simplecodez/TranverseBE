import catchAsync from '../utils/catchAsync.js';

class CommentController {
  constructor(Model) {
    this.Model = Model;
  }

  create() {
    return catchAsync(async (req, res, next) => {
      const { comment } = req.body;
      const { id } = req.params;
      const { _id } = req.user;

      const data = {
        comment,
        project: id,
        commentBy: _id
      };
      await this.Model.create(data);
      res.status(200).json({
        status: 'success',
        message: 'Comment registered!'
      });
    });
  }

  get() {
    return catchAsync(async (req, res, next) => {
      const comments = await this.Model.find({ project: req.params.id }).populate("commentBy");
      res.status(200).json({
        status: 'success',
        comments
      });
    });
  }
}

export default CommentController;
