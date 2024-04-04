import Project from '../../../models/projectModel.js';
import AppError from '../../../utils/appError.js';
import catchAsync from '../../../utils/catchAsync.js';
import { createNotification } from '../../../controllers/notificationController.js';
import User from '../../../models/userModel.js';

const updateProjecDetails = catchAsync(async (req, res, next) => {
  const { title, description, email, dueDate } = req.body;
  const taskID = req.query.taskId;

  if (!title && !description && !email && !dueDate)
    return next(new AppError('Please provide some information to update the task.', 400));

  const project = await Project.findOne({ _id: req.params.id, active: true });

  if (!project.owner.equals(req.user._id)) return next(new AppError('Your are not authorized for this action!', 401));

  const taskIndex = project.tasks.findIndex((task) => task._id.equals(taskID));

  if (taskIndex === -1) {
    return next(new AppError('Task not found in project.', 404));
  }

  let updatedTaskData = { ...project.tasks[taskIndex] };

  if (title) updatedTaskData = { ...updatedTaskData, title };

  if (description) updatedTaskData = { ...updatedTaskData, description };

  if (email) {
    const user = await User.findOne({ email, active: true }).lean();
    if (!user) return next(new AppError(`No user found with email: ${email}.`, 404));
    const member = project.teamMembers.find((member) => member.user.equals(user._id));
    if (!member) return next(new AppError(`The user with ${email} is not a member of this project yet.`, 404));
    updatedTaskData = { ...updatedTaskData, assignedTo: user._id };
  }

  if (dueDate) updatedTaskData = { ...updatedTaskData, dueDate };

  Object.assign(project.tasks[taskIndex], updatedTaskData);

  await project.save();

  if (project.teamMembers.length > 0) {
    const notificationPromise = project.teamMembers.map((id) =>
      createNotification(id, 'update', `The task- ${project.tasks[taskIndex].title} has been updated, take a look.`)
    );
    await Promise.all(notificationPromise);
  }

  res.status(200).json({
    status: 'success',
    message: `${title} has been updated successfully.`
  });
});

export default updateProjecDetails;
