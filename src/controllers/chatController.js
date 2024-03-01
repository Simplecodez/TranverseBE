import { userSockets } from '../../socket.js';
import Chat from '../models/chatModel.js';
import User from '../models/userModel.js';
import catchAsync from '../utils/catchAsync.js';
import { createNotification } from './notificationController.js';

const sendChat = catchAsync(async (req, res, next) => {
  const { receiverId, message } = req.body;
  const senderId = req.user._id;

  // Create a new chat
  const chat = new Chat({
    sender: senderId,
    receiver: receiverId,
    message,
  });

  // Notify the receiver
  const receiver = await User.findById(receiverId);
  const chatNotificationMessage = `New chat from ${req.user.name}`;
  await createNotification(receiver, 'chat', chatNotificationMessage);

  // Emit the message to the recipient's socket
  const receiverSocket = userSockets.get(receiverId);

  if (receiverSocket) {
    receiverSocket.emit('chat', chat);
  }

  // Save the chat to the database
  chat.save();

  res.status(200).json({
    status: 'success',
    chat,
  });
});

const getChats = catchAsync(async (req, res, next) => {
  // Find all chats for both receiver and sender
  const userId = req.user._id;
  const chats = await Chat.find({ $or: [{ sender: userId }, { receiver: userId }] })
    .populate('sender', 'name')
    .populate('receiver', 'name');

  res.status(200).json({
    status: 'success',
    count: chats.length,
    chats,
  });
});

export { sendChat, getChats };