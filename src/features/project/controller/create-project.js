import Project from '../../../models/projectModel.js';
import User from '../../../models/userModel.js';
import AppError from '../../../utils/appError.js';
import catchAsync from '../../../utils/catchAsync.js';
import Email from '../../../utils/email.js';
import { emailingPromise } from '../../../utils/helperFun.js';
import { createNotification } from '../../../controllers/notificationController.js';

const createProject = catchAsync(async (req, res, next) => {
  const { title, description, teamMembers, startDate, endDate, price } = req.body;
  //'2022-02-15T12:30:00'
  const mongoStartDate = new Date(startDate);
  const mongoEndDate = new Date(endDate);
  const durationInMilliseconds = mongoEndDate - mongoStartDate;

  if (durationInMilliseconds < 0)
    return next(new AppError('Sorry, Start date cannot be later than End date!', 400));

  const durationInDays = durationInMilliseconds / (1000 * 60 * 60 * 24);

  const newProject = {
    title,
    description,
    price,
    duration: durationInDays,
    startDate: mongoStartDate,
    endDate: mongoEndDate,
    owner: req.user._id
  };

  const project = await Project.create(newProject);

  if (teamMembers.length > 0) {
    const users = await User.find({ email: { $in: teamMembers } }, { _id: 1 }).lean();
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

  await emailingPromise(Project, url, teamMembers, project, 'create', Email);

  res.status(200).json({
    status: 'success',
    project
  });
});

export default createProject;
