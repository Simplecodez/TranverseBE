import Project from '../../../models/projectModel.js';
import catchAsync from '../../../utils/catchAsync.js';

const getTask = catchAsync(async (req, res, next) => {
  const tasks = await Project.aggregate([
    {
      $match: {
        $or: [{ owner: req.user._id }, { 'teamMembers.user': req.user._id }]
      }
    },
    { $unwind: '$tasks' },
    { $match: { 'tasks.assignedTo': req.user._id } },
    {
      $project: {
        _id: 0, // Exclude the project ID
        title: 1, // Include Project title
        task: '$tasks' // Project only the tasks
      }
    }
  ]);

  res.status(200).json({
    status: 'success',
    count: tasks.length,
    tasks
  });
});

export default getTask;
