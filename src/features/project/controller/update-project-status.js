import Project from '../../../models/projectModel.js';
import AppError from '../../../utils/appError.js';
import catchAsync from '../../../utils/catchAsync.js';
import { createNotification } from '../../../controllers/notificationController.js';

const updateProjectStatus = catchAsync(async (req, res, next) => {
  const { status } = req.body;
  const project = await Project.findOne({ _id: req.params.id, active: true });

  if (!project) return next(new AppError('Sorry, this project does not exist!', 400));

  if (project && !project.owner.equals(req.user._id))
    return next(new AppError('Your are not authorized for this action!', 401));

  project.status = status;
  await project.save();

  if (project.teamMembers.length > 0) {
    const notificationPromise = project.teamMembers.map((id) =>
      createNotification(
        id,
        'status',
        `The status of ${project.title} has been updated, take a look.`
      )
    );
    await Promise.all(notificationPromise);
  }

  res.status(200).json({
    status: 'success',
    message: `You have updated project status to ${status}.`
  });
});

export default updateProjectStatus;
