import Project from '../../../models/projectModel.js';
import User from '../../../models/userModel.js';
import AppError from '../../../utils/appError.js';
import catchAsync from '../../../utils/catchAsync.js';
import Email from '../../../utils/email.js';
import { createNotification } from '../../../controllers/notificationController.js';

const assignTasks = catchAsync(async (req, res, next) => {
  const { task, email, name, dueDate, dueTime } = req.body;
  const projectID = req.params.id;
  const project = await Project.findOne({
    _id: projectID,
    owner: req.user._id,
    active: true
  });

  if (!project) {
    return next(new AppError('Project not found, might have been deleted.', 404));
  }
  const member = await User.findOne({ email, active: true });
  if (!member) return next(new AppError('This user does not exist!', 400));

  const result = project.teamMembers.find((mem) => mem.user.equals(member._id));

  if (!result) {
    return next(new AppError('The user is not a member of the project yet.', 400));
  }

  task.assignedTo = member._id;
  task.dueDate = dueDate;
  task.dueTime = dueTime;

  project.tasks.push(task);

  // Awaiting the promise to resolve individually to get errors that may occur.
  await project.save();
  await createNotification(
    member._id,
    'assigned',
    `You've been assigned a task on ${project.title}.`
  );

  const url = 'https://traversemob.vercel.app/notification';

  try {
    await new Email({ email, name }).sendAssignedTask(task.title, project.title, url);
  } catch (error) {
    project.tasks.pop();
    await project.save();
    return next(error);
  }
  res.status(200).json({
    status: 'success',
    message: 'Task has been assigned successfully.'
  });
});

export default assignTasks;
