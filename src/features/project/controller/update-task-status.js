import Project from '../../../models/projectModel.js';
import AppError from '../../../utils/appError.js';
import catchAsync from '../../../utils/catchAsync.js';
import { createNotification } from '../../../controllers/notificationController.js';

const updateTaskStatus = catchAsync(async (req, res, next) => {
  const { status } = req.body;
  const taskID = req.query.taskId;

  const statuses = ['Todo', 'InProgress', 'InReview'];

  const project = await Project.findOne({ _id: req.params.id, active: true });

  if (!project) return next(new AppError('Sorry, this project does not exist!', 404));

  const foundTeamMember = project.teamMembers.find((member) => member.user.equals(req.user._id));

  if (!foundTeamMember) return next(new AppError('You are not authorized for this action!', 401));

  if (status === 'Done' && !project.owner.equals(req.user._id))
    return next(
      new AppError('Your are not authorized for this action! you are not allowed to mark this task as Done!', 401)
    );

  const taskIndex = project.tasks.findIndex((task) => task._id.equals(taskID));

  // This checks if the user is the owner of the project.
  // if yes, and the status includes includes any status from the array of statuses.
  // Then the id if the user is compared to that of the assignee.
  // if the don match, he can update the status to any from the statuses array.

  if (
    statuses.includes(status) &&
    project.owner.equals(req.user._id) &&
    !project.tasks[taskIndex].assignedTo.equals(req.user._id)
  )
    return next(new AppError('Your are not authorized for this action! You can only mark task as Done.', 401));

  if (taskIndex === -1) {
    return next(new AppError('Task not found in project', 404));
  }

  const updatedTaskData = { ...project.tasks[taskIndex], status };

  Object.assign(project.tasks[taskIndex], updatedTaskData);

  await project.save();

  if (project.teamMembers.length > 0) {
    const notificationPromise = project.teamMembers.map((id) =>
      createNotification(
        id,
        'status',
        `The status of task- ${project.tasks[taskIndex].title} has been updated, take a look.`
      )
    );
    await Promise.all(notificationPromise);
  }

  res.status(200).json({
    status: 'success',
    message: `You have updated task status to ${status}.`
  });
});

export default updateTaskStatus;
