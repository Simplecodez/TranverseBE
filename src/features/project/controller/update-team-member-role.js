import { createNotification } from '../../../controllers/notificationController.js';
import Project from '../../../models/projectModel.js';
import AppError from '../../../utils/appError.js';
import catchAsync from '../../../utils/catchAsync.js';

const updateProjectTeamLead = catchAsync(async (req, res, next) => {
  const projectID = req.params.id;
  const userIDToBeChanged = req.params.userId;

  const project = await Project.findById(projectID);

  if (!project) return next(new AppError('Project not found!', 404));
  if (!project.owner.equals(req.user._id)) return next(new AppError('You are unauthorized for this action.', 403));
  if (project.teamMembers.length <= 0) return next(new AppError('No colloborators yet. Please add one.'));

  const teamMemberIndex = project.teamMembers.findIndex((member) => member.user._id.toJSON() === userIDToBeChanged);
  if (teamMemberIndex === -1) return next(new AppError('Team member not found!', 404));

  const userName = project.teamMembers[teamMemberIndex].user.name;
  if (project.teamMembers[teamMemberIndex].role === 'team-lead')
    return next(new AppError(`${userName} is already the team lead.`, 400));

  // Remove existing team-lead
  const teamMemberAlreadyTeamleadIndex = project.teamMembers.findIndex((member) => member.role === 'team-lead');
  if (teamMemberAlreadyTeamleadIndex !== -1) {
    project.teamMembers[teamMemberAlreadyTeamleadIndex].role = 'member';
  }

  project.teamMembers[teamMemberIndex].role = 'team-lead';

  await project.save();

  if (project.teamMembers.length > 0) {
    const notificationPromise = project.teamMembers.map((id) =>
      createNotification(id, 'update', `${userName} has been made the team lead!`)
    );
    await Promise.all(notificationPromise);
  }
  res.status(200).json({
    status: 'success',
    message: `${userName} is now the team lead.`
  });
});

export default updateProjectTeamLead;
