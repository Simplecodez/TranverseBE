import Project from '../../../models/projectModel.js';
import catchAsync from '../../../utils/catchAsync.js';

const getOne = catchAsync(async (req, res, next) => {
  const project = await Project.findOne({
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
    ],
    _id: req.params.id
  })
    .populate('owner')
    .populate('teamMembers');

  res.status(200).json({
    status: 'success',
    project
  });
});

export default getOne;
