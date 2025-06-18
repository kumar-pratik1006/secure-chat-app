const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: '*' }
});

// Serve static files
app.use(express.static(path.join(__dirname, 'public')));

let onlineUsers = 0;

// Socket.io logic
io.on('connection', socket => {
  onlineUsers++;
  io.emit('update-user-count', onlineUsers);

  socket.on('join-room', room => {
    socket.join(room);
  });

  socket.on('send-message', ({ room, message }) => {
    io.to(room).emit('receive-message', message);
  });

  socket.on('disconnect', () => {
    onlineUsers = Math.max(0, onlineUsers - 1);
    io.emit('update-user-count', onlineUsers);
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
