import Chat from '../models/chatModel.js';
import User from '../models/userModel.js';
import catchAsync from '../utils/catchAsync.js';
import { createNotification } from './notificationController.js';

const sendChat = catchAsync(async (req, res, next) => {
  const { receiverId, message } = req.body;
  const senderId = req.user._id;

  // Create a new chat
  const chat = await Chat.create({
    sender: senderId,
    receiver: receiverId,
    message
  });

  // Notify the receiver
  const receiver = await User.findById(receiverId);
  const chatNotificationMessage = `New chat from ${req.user.name}`;
  await createNotification(receiver, 'chat', chatNotificationMessage);

  // Pass the chat through Socket.IO
  req.app.get('io').emit('chat', chat);

  res.status(200).json({
    status: 'success',
    chat
  });
});

const getChats = catchAsync(async (req, res, next) => {
  const userId = req.user._id;

  // Find all chats for both reciever and sender
  const chats = await Chat.find({ $or: [{ sender: userId }, { receiver: userId }] })
    .populate('sender', 'name')
    .populate('receiver', 'name');

  res.status(200).json({
    status: 'success',
    count: chats.length,
    chats
  });
});

export { sendChat, getChats };