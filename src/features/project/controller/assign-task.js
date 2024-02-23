import Project from '../../../models/projectModel.js';
import User from '../../../models/userModel.js';
import AppError from '../../../utils/appError.js';
import catchAsync from '../../../utils/catchAsync.js';
import Email from '../../../utils/email.js';

import { createNotification } from '../../../controllers/notificationController.js';

const assignTasks = catchAsync(async (req, res, next) => {
  const { task, email, name } = req.body;
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
  project.tasks.push(task);

  await Promise.all([
    project.save(),
    createNotification(
      member._id,
      'assigned',
      `You've been assigned a task on ${project.title}.`
    )
  ]);

  try {
    await new Email({ email, name }).sendProjectCreated(
      email,
      project.title,
      'to be worked on....',
      `${req.user.name} assigned ${task.title} task to you on project - ${project.title}`
    );
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
