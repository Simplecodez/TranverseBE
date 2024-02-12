import User from '../models/userModel.js';
import AppError from '../utils/appError.js';
import catchAsync from '../utils/catchAsync.js';

const userSearch = catchAsync(async (req, res, next) => {
  const { query } = req.body;
  let users = [];
  if (query.length >= 3) {
    // Search function by name or email
    users = await User.find({
      $or: [
        { name: { $regex: query, $options: 'i' } },
        { email: { $regex: query, $options: 'i' } }
      ]
    });
  }
  res.status(200).json({
    status: 'success',
    count: users.length,
    users
  });
});

export { userSearch };
