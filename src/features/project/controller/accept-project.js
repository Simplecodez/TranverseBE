import Project from '../../../models/projectModel.js';
import catchAsync from '../../../utils/catchAsync.js';
import { createNotification } from '../../../controllers/notificationController.js';

const acceptProject = catchAsync(async (req, res, next) => {
  const userID = req.user._id;
  const projectID = req.query.id;
  const project = await Project.findOne({ _id: projectID });

  // Check if the user is already a member of the project
  const isMember = project.teamMembers.some(
    (member) => member.user.equals(userID) && member.accepted === true
  );
  if (isMember) {
    return next(new AppError('You are already a member of this project.', 400));
  }

  await Project.findOneAndUpdate(
    {
      _id: projectID,
      'teamMembers.user': userID // Find the project by ID and matching user ID in teamMembers
    },
    {
      $set: {
        'teamMembers.$.accepted': true // Update accepted field to true for the matched user
      }
    },
    {
      new: true
    }
  );

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
