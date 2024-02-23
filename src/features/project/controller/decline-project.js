import Project from '../../../models/projectModel.js';
import User from '../../../models/userModel.js';
import catchAsync from '../../../utils/catchAsync.js';
import Email from '../../../utils/email.js';
import { createNotification } from '../../../controllers/notificationController.js';

const declineProject = catchAsync(async (req, res, next) => {
  console.log(req.originalUrl);
  const { id } = req.query;
  const project = await Project.findById(id);
  const { _id, email, name } = await User.findById(project.owner);

  await createNotification(
    project.owner,
    'declined',
    `${req.user.name} declined your offer to join ${project.title}.`
  );

  try {
    await new Email({ email, name }).sendDeclineProject(
      `${req.user.name.split(' ')[0]} declined the offer to work on ${
        project.title
      } project.`,
      'Invite declined'
    );
  } catch (error) {
    return next(error);
  }
  res.status(200).json({
    status: 'success',
    message: `You declined the ${project.title} project offer from ${name}.`
  });
});

export default declineProject;
