import Project from '../../../models/projectModel.js';
import catchAsync from '../../../utils/catchAsync.js';

const getAll = catchAsync(async (req, res, next) => {
  const projects = await Project.find({
    active: true,
    $or: [
      { owner: req.user._id },
      {
        teamMembers: {
          $elemMatch: {
            user: req.user._id
          }
        }
      }
    ]
  })
    .populate('owner')
    .populate('teamMembers');
  console.log(req.user._id);

  res.status(200).json({
    status: 'success',
    count: projects.length,
    projects
  });
});

export default getAll;
