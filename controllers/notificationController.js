import Notification from '../models/notificationModel.js';
import catchAsync from '../utils/catchAsync.js';

const createNotification = catchAsync(async (user, project, message) => {
  await Notification.create({ user: user._id, project, message });
})

const getNotifications = catchAsync(async (req, res, next) => {
  const notifications = await Notification.find({ user: req.user._id })
    .populate('project')
    .sort('-createdAt');

  res.status(200).json({
    status: 'success',
    count: notifications.length,
    notifications
  });
});

export { createNotification, getNotifications };
