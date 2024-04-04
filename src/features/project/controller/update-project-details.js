import Project from '../../../models/projectModel.js';
import AppError from '../../../utils/appError.js';
import catchAsync from '../../../utils/catchAsync.js';
import { createNotification } from '../../../controllers/notificationController.js';

const updateProjectStatusAndDescription = catchAsync(async (req, res, next) => {
  const { status, description } = req.body;
  const project = await Project.findOne({ _id: req.params.id, active: true });

  if (!project) return next(new AppError('Sorry, this project does not exist!', 400));

  if (project && !project.owner.equals(req.user._id))
    return next(new AppError('Your are not authorized for this action!', 401));

  if (description) project.description = description;
  if (status) project.status = status;

  const notificationType = description && status ? 'details' : description && !status ? 'description' : 'status';
  const notificationMessage =
    description && status
      ? `${project.title}'s description and status of have been updated, take a look.`
      : description && !status
      ? `${project.title}'s description has been updated, take a look.`
      : `${project.title}'s status has been updated, take a look.`;

  await project.save();

  if (project.teamMembers.length > 0) {
    const notificationPromise = project.teamMembers.map((id) =>
      createNotification(id, `${notificationType}`, `${notificationMessage}`)
    );
    await Promise.all(notificationPromise);
  }

  res.status(200).json({
    status: 'success',
    message: notificationMessage
  });
});

export default updateProjectStatusAndDescription;
