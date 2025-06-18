// server.js
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: '*' },
  pingTimeout: 60000, // 60 sec timeout to prevent auto disconnect
});

app.use(express.static(path.join(__dirname, 'public')));

let roomUsers = {}; // Room: Set of socket ids

io.on('connection', socket => {
  let currentRoom = '';

  socket.on('join-room', room => {
    if (currentRoom) {
      socket.leave(currentRoom);
      roomUsers[currentRoom]?.delete(socket.id);
      updateUserCount(currentRoom);
    }
    currentRoom = room;
    socket.join(room);

    if (!roomUsers[room]) roomUsers[room] = new Set();
    roomUsers[room].add(socket.id);
    updateUserCount(room);
  });

  socket.on('send-message', ({ room, message }) => {
    socket.to(room).emit('receive-message', message);
  });

  socket.on('disconnect', () => {
    if (currentRoom) {
      roomUsers[currentRoom]?.delete(socket.id);
      updateUserCount(currentRoom);
    }
  });
});

function updateUserCount(room) {
  const count = roomUsers[room]?.size || 0;
  io.to(room).emit('update-users', count);
}

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
