// notificationModel.js
import mongoose from 'mongoose';

const notificationSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: true
  },
  notification_type: {
    type: String,
    enum: ['invite', 'accepted', 'status', 'assigned', 'declined', 'tagged', 'details', 'update', 'description']
  },
  message: {
    type: String,
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  read: {
    type: Boolean,
    default: false
  }
});

const Notification = mongoose.model('Notification', notificationSchema);

export default Notification;
