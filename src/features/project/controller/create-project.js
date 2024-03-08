import Project from '../../../models/projectModel.js';
import User from '../../../models/userModel.js';
import AppError from '../../../utils/appError.js';
import catchAsync from '../../../utils/catchAsync.js';
import Email from '../../../utils/email.js';
import { emailingPromise } from '../../../utils/helperFun.js';
import { createNotification } from '../../../controllers/notificationController.js';
import addedTeamMemberFunc from '../auxFunction/addTeamMember.js';
import durationInDaysFunc from '../auxFunction/durationInDays.js';

const createProject = catchAsync(async (req, res, next) => {
  const { title, description, teamMembers, startDate, endDate, price } = req.body;
  //'2022-02-15T12:30:00'

  const { durationInDays, mongoStartDate, mongoEndDate } = durationInDaysFunc(
    startDate,
    endDate
  );

  const newTeamMembers = teamMembers ? teamMembers : [];

  const users =
    newTeamMembers.length > 0
      ? await User.find({ email: { $in: newTeamMembers } }, { _id: 1, email: 1 }).lean()
      : [];

  const addedTeamMember = addedTeamMemberFunc(users, newTeamMembers);
  addedTeamMember.push({ user: req.user._id });

  const newProject = {
    title,
    description,
    price,
    duration: durationInDays,
    startDate: mongoStartDate,
    endDate: mongoEndDate,
    owner: req.user._id,
    teamMembers: addedTeamMember
  };

  const project = await Project.create(newProject);

  await Project.populate(project, { path: 'teamMembers.user' }); // Populates the user field of the added team members

  if (newTeamMembers.length > 0) {
    const notificationPromise = users.map((user) =>
      createNotification(
        user._id,
        'invite',
        `You got an invite from ${req.user.name} to collaborate on ${title} `
      )
    );
    await Promise.all(notificationPromise);
  }

  project.email = req.user.email;

  project.name = req.user.name;

  const url = `https://traversemob.vercel.app/project/accept?id=${project._id}`;

  await emailingPromise(Project, url, newTeamMembers, project, 'create', Email);

  res.status(200).json({
    status: 'success',
    project
  });
});

export default createProject;
