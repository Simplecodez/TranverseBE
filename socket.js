import http from 'http';
import { Server } from 'socket.io';

const initSocket = (server) => {
  const io = new Server(server);

  io.on('connection', (socket) => {
    console.log('A user connected');

    // Handle chat events
    socket.on('chat', (data) => {
      io.emit('chat', data); 
    });

    
    socket.on('disconnect', () => {
      console.log('User disconnected');
    });
  });

  return io;
};

export default initSocket;
