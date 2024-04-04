import Project from '../../../models/projectModel.js';
import User from '../../../models/userModel.js';
import AppError from '../../../utils/appError.js';
import catchAsync from '../../../utils/catchAsync.js';
import { emailingPromise } from '../../../utils/helperFun.js';
import { createNotification } from '../../../controllers/notificationController.js';
import addedTeamMemberFunc from '../auxFunction/addTeamMember.js';

const updateProjectTeamMembers = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const { teamMembers } = req.body;

  if (teamMembers.length <= 0)
    return next(new AppError('Please provide email(s) of the collaborator(s) you want to add.'));

  // Check whether project already exist
  const project = await Project.findById(id);
  if (!project) return next(new AppError('Sorry, project does not exist.', 404));

  // Check whether the users are already project members
  const users = await User.find({ email: { $in: teamMembers } }, { _id: 1, email: 1 }).lean();

  const usersIDString = users.map((user) => user._id.toString());

  if (project.teamMembers.length > 0) {
    const teamMembersExisting = project.teamMembers.filter((member) => {
      if (usersIDString.includes(member.user._id.toString())) return member.user._id.toJSON();
    });
    if (teamMembersExisting.length > 0)
      return next(new AppError('Some of the collaborators you intend to add, already exist!', 400));
  }

  // check whether the users are on Traverse and return the users in a object form
  const { addedTeamMember, notFoundEmails, foundEmails } = addedTeamMemberFunc(users, teamMembers, req);

  // Add the users to the project team members
  project.teamMembers.push(...addedTeamMember);
  project.usersNotRegistered.push(...notFoundEmails);
  await project.save();
  await Project.populate(project, { path: 'teamMembers.user' });

  // append the owners
  project.name = req.user.name;
  project.email = req.user.email;

  const url = `${process.env.FE_URL}/accept?id=${project._id}`;

  const notificationPromise = users.map((user) =>
    createNotification(
      user._id,
      'invite',
      `You got an invite from ${req.user.name} to collaborate on ${project.title} `
    )
  );

  await Promise.all([
    Promise.all(notificationPromise),
    emailingPromise(url, foundEmails, notFoundEmails, project, 'update')
  ]);

  res.status(200).json({
    status: 'success',
    message:
      notFoundEmails.length <= 0 && foundEmails.length > 0
        ? 'Project was created successfully and invites have been sent.'
        : `These email(s) don't have accounts on Traverse: ${notFoundEmails.join(
            ', '
          )}. An invite has been sent to them to join traverse.`,
    project
  });
});

export default updateProjectTeamMembers;
