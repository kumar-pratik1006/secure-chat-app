const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: '*' },
  pingInterval: 25000,
  pingTimeout: 60000
});

// Serve static frontend
app.use(express.static(path.join(__dirname, 'public')));

// 🔁 Temporary in-memory message queues
const messageQueues = {};  // { roomId: [message1, message2, ...] }

const onlineUsers = {}; // roomId => Set of socket ids

io.on('connection', socket => {
  let joinedRoom = null;

  socket.on('join-room', room => {
    joinedRoom = room;
    socket.join(room);

    // Track user in online list
    if (!onlineUsers[room]) onlineUsers[room] = new Set();
    onlineUsers[room].add(socket.id);

    // Send queued messages if any
    if (messageQueues[room]) {
      messageQueues[room].forEach(msg => {
        socket.emit('receive-message', msg);
      });
      delete messageQueues[room]; // clear after delivery
    }

    // Update online count
    io.to(room).emit('update-users', onlineUsers[room].size);
  });

  socket.on('send-message', ({ room, message }) => {
    // Broadcast to others
    const roomSockets = onlineUsers[room];
    if (roomSockets && roomSockets.size > 1) {
      socket.to(room).emit('receive-message', message);
    } else {
      // Store if no one else is online
      if (!messageQueues[room]) messageQueues[room] = [];
      messageQueues[room].push(message);
    }
  });

  socket.on('disconnect', () => {
    if (joinedRoom && onlineUsers[joinedRoom]) {
      onlineUsers[joinedRoom].delete(socket.id);
      if (onlineUsers[joinedRoom].size === 0) {
        delete onlineUsers[joinedRoom]; // clean empty room
      } else {
        io.to(joinedRoom).emit('update-users', onlineUsers[joinedRoom].size);
      }
    }
  });

  socket.on('heartbeat', ({ room }) => {
    // keep-alive
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
