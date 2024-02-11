import Project from "../models/projectModel.js";
import User from "../models/userModel.js";
import AppError from "../utils/appError.js";
import catchAsync from "../utils/catchAsync.js";
import Email from "../utils/email.js";

const createProject = catchAsync(async (req, res, next) => {
  const { title, description, teamMembers, startDate, endDate, price } =
    req.body;
  //'2022-02-15T12:30:00'
  const mongoStartDate = new Date(startDate);
  const mongoEndDate = new Date(endDate);
  const durationInMilliseconds = mongoEndDate - mongoStartDate;
  const durationInDays = durationInMilliseconds / (1000 * 60 * 60 * 24);
  const newProject = {
    title,
    description,
    price,
    duration: durationInDays,
    startDate: mongoStartDate,
    endDate: mongoEndDate,
    owner: req.user._id,
  };

  const project = await Project.create(newProject);
  project.email = req.user.email;
  project.name = req.user.name;
  const url = `${req.protocol}://${req.get("host")}/api/v1/project/accept?id=${
    project._id
  }`;
  try {
    const promiseAsync = teamMembers.map((email) =>
      new Email(project).sendProjectCreated(
        email,
        project.projectName,
        url,
        "You've been invited to join a project on Traverse."
      )
    );
    const userProjectPromise = new Email(project).sendUserProject(
      project.projectName,
      "Successful project creation!"
    );
    const totalPromise = [...promiseAsync, userProjectPromise];
    await Promise.all(totalPromise);
  } catch (err) {
    await Project.deleteOne({ _id: project._id });
    return next(err);
  }
  res.status(200).json({
    status: "success",
    project,
  });
});

const updateProjectStatus = catchAsync(async (req, res, next) => {
  const status = req.body.status;
  const project = await Project.findOne({ _id: req.params.id });
  project.status = status;
  await project.save();
  res.status(200).json({
    status: "success",
    message: `You have updated project status to ${status}.`,
  });
});

const acceptProject = catchAsync(async (req, res, next) => {
  const userID = req.user._id;
  const projectID = req.query.id;
  const project = await Project.findOne({ _id: projectID });
  const member = { user: userID };

  project.teamMembers.push(member);
  await project.save();
  res.status(200).json({
    status: "success",
    message: `You have accepted to join the ${project.title} project.`,
  });
});

const getAll = catchAsync(async (req, res, next) => {
  const projects = await Project.find({
    active: true,
    $or: [{ owner: req.user._id }, { teamMembers: { $in: [req.user._id] } }],
  })
    .populate("owner")
    .populate("teamMembers");

  res.status(200).json({
    status: "success",
    count: projects.length,
    projects,
  });
});

const getOne = catchAsync(async (req, res, next) => {
  const project = await Project.findOne({
    active: true,
    $or: [{ owner: req.user._id }, { teamMembers: { $in: [req.user._id] } }],
    _id: req.params.id,
  })
    .populate("owner")
    .populate("teamMembers");

  res.status(200).json({
    status: "success",
    project,
  });
});

const deleteProject = catchAsync(async (req, res, next) => {
  const projectID = req.params.id;
  const project = await Project.findOne({
    _id: projectID,
    owner: req.user._id,
  });
  project.active = false;
  await project.save();
  res.status(204).json({
    status: "success",
    message: `You have successfully deleted the ${project.projectName}.`,
  });
});

const assignTasks = catchAsync(async (req, res, next) => {
  const { task, email, name } = req.body;
  const projectID = req.params.id;
  const project = await Project.findOne({
    _id: projectID,
    owner: req.user._id,
    active: true,
  });
  console.log(req.user._id);
  if (!project) {
    return next(
      new AppError("Project not found, might have been deleted.", 404)
    );
  }
  const member = await User.findOne({ email, active: true });
  if (!member) return next(new AppError("This user does not exist!", 400));
  const result = project.teamMembers.find((mem) => mem.user === member._id);

  if (result) {
    next(new AppError("The user is not a member of the project yet.", 400));
  }
  task.assignedTo = member._id;
  project.tasks.push(task);
  await project.save();

  try {
    await new Email({ email, name }).sendProjectCreated(
      email,
      project.title,
      "to be worked on....",
      `${req.user.name} assigned ${task.title} task to you on project - ${project.title}`
    );
  } catch (error) {
    await Project.deleteOne({ _id: project._id });
    return next(error);
  }

  res.status(200).json({
    status: "success",
    message: "Task has been assigned successfully.",
  });
});

export {
  createProject,
  acceptProject,
  updateProjectStatus,
  getOne,
  getAll,
  deleteProject,
  assignTasks,
};
