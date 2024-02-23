import Notification from '../models/notificationModel.js';
import catchAsync from '../utils/catchAsync.js';

const createNotification = async (user, type, message) => {
  await Notification.create({ user: user._id, notification_type: type, message });
};

const getNotifications = catchAsync(async (req, res, next) => {
  console.log(req.user.name, req.user._id);
  const notifications = await Notification.find({ user: req.user._id }).sort({
    createAt: -1
  });

  res.status(200).json({
    status: 'success',
    count: notifications.length,
    notifications
  });
});

export { createNotification, getNotifications };
