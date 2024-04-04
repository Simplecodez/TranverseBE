import Notification from '../models/notificationModel.js';
import catchAsync from '../utils/catchAsync.js';
import User from '../models/userModel.js';

const createNotification = async (user, type, message) => {
  try {
    await Notification.create({ user: user._id, notification_type: type, message });
  } catch (error) {
    throw error;
  }
};

const createNotificationFE = catchAsync(async (req, res, next) => {
  const { type, message, email } = req.body;
  const user = await User.findOne({ email }, { _id: 1, name: 1 }).lean();
  await Notification.create({ user: user._id, notification_type: type, message });
  res.status(200).json({ status: 'success', message: `${user.name} will be notified.` });
});

const getNotifications = catchAsync(async (req, res, next) => {
  const notifications = await Notification.find({ user: req.user._id }).sort({
    createAt: -1
  });

  res.status(200).json({
    status: 'success',
    count: notifications.length,
    notifications
  });
});

export { createNotification, getNotifications, createNotificationFE };
