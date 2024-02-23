import Project from '../../../models/projectModel.js';
import User from '../../../models/userModel.js';
import catchAsync from '../../../utils/catchAsync.js';
import Email from '../../../utils/email.js';
import { emailingPromise } from '../../../utils/helperFun.js';
import { createNotification } from '../../../controllers/notificationController.js';

const acceptProject = catchAsync(async (req, res, next) => {
  const userID = req.user._id;
  const projectID = req.query.id;
  const project = await Project.findOne({ _id: projectID });

  // Check if the user is already a member of the project
  const isMember = project.teamMembers.some((member) => member.user.equals(userID));
  if (isMember) {
    return next(new AppError('You are already a member of this project.', 400));
  }

  const member = {
    user: userID,
    role: 'member' // or 'team-lead' based on your requirements
  };

  project.teamMembers.push(member);
  await project.save();

  // Create a notification for the project owner
  await createNotification(
    project.owner,
    'accepted',
    `${req.user.name} has accepted your request to collaborate on ${project.title} `
  );

  res.status(200).json({
    status: 'success',
    message: `You have accepted to join the ${project.title} project.`
  });
});

export default acceptProject;
