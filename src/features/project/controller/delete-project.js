import Project from '../../../models/projectModel.js';
import AppError from '../../../utils/appError.js';
import catchAsync from '../../../utils/catchAsync.js';

const deleteProject = catchAsync(async (req, res, next) => {
  const projectID = req.params.id;

  const project = await Project.findOne({
    _id: projectID,
    owner: req.user._id,
    active: true
  });

  if (!project) return next(new AppError('Project does not exist!', 400));

  project.active = false;
  await project.save();
  res.status(204).json({
    status: 'success',
    message: `You have successfully deleted the ${project.title}.`
  });
});

export default deleteProject;
