import http from 'http';
import { Server } from 'socket.io';

// Create a Map to store user IDs and their associated sockets
const userSockets = new Map();

const initSocket = (server) => {
  const io = new Server(server);

  io.on('connection', (socket) => {
    console.log('A user connected');

    // Handle connection by updating the userSockets Map
    const userId = socket.handshake.query.userId;
    userSockets.set(userId, socket);

    // Handle chat events
    socket.on('chat', (data) => {
      const { receiverId, message } = data;

      // Emit the chat message only to the intended recipient's socket
      const receiverSocket = userSockets.get(receiverId);

      if (receiverSocket) {
        receiverSocket.emit('chat', data);
      }
    });

    // Disconnect event
    socket.on('disconnect', () => {
      console.log('User disconnected');
      
      // Handle disconnection by updating the userSockets Map
      userSockets.delete(userId);
    });
  });

  return io;
};

export { initSocket, userSockets };
