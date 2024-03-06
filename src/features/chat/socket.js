import { Server } from 'socket.io';
import protectAux from '../auth/auxFunctions/protect.js';

const initSocket = (server) => {
  const io = new Server(server);

  io.use(async (socket, next) => {
    const token = socket.handshake.headers.authorization;
    protectAux(token, next);
    next();
  });

  io.on('connection', (socket) => {
    console.log('A user connected');

    // Handle chat events

    socket.on('joinRoom', (room) => {
      socket.join(room);
      console.log(`User ${socket.id} joined room ${room}`);
      activeRooms.set(room, { users: new Set([socket.id]) });
    });

    socket.on('new-message', (data) => {
      io.emit('new-message', data);
      socket.to();
    });

    socket.on('private message', ({ recipientId, message }) => {
      const roomId = getPrivateRoomId(socket.id, recipientId);
      socket.join(roomId);
      io.to(roomId).emit('private message', { senderId: socket.id, message });
    });

    socket.on('disconnect', () => {
      console.log('User disconnected');
    });
  });

  return io;
};

export default initSocket;
