import Project from "../models/projectModel";
import User from "../models/userModel";
import catchAsyn from "../utils/catchAsync";
import Email from "../utils/email";

const createProject = catchAsyn(async (req, res, next) => {
  const {
    projectName,
    description,
    teamMembers,
    duration,
    startDate,
    endDate,
  } = req.body;

  const newProject = {
    projectName,
    description,
    teamMembers,
    duration,
    startDate,
    endDate,
    createdBy: req.user.id,
  };

  const project = await Project.create(newProject);
  project.email = req.user.email;
  project.name = req.user.name;
  const url = `${req.protocol}://${req.get("host")}/accept?id=${project.id}`;
  try {
    const promiseAsync = teamMembers.map((email) =>
      Email(project).sendProjectCreated(
        email,
        project.projectName,
        url,
        "You've been invited to join a project on Traverse."
      )
    );
    const userProjectPromise = Email.sendUserProject(
      project.project.projectName,
      "Successful project creation!"
    );
    const totalPromise = [...promiseAsync, Email.sendUserProject];
    await Promise.all(totalPromise);
  } catch (err) {
    await Project.deleteOne({ _id: project._id });
    return next(err);
  }
});
