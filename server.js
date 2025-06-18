
const socket = io();
let room = '';

function joinRoom() {
  room = document.getElementById('room').value;
  if (room.trim() === '') return;
  socket.emit('join-room', room);
  logMsg('✅ Joined room: ' + room);
}

function sendMsg() {
  const msg = document.getElementById('msgInput').value;
  if (msg.trim() === '') return;
  socket.emit('send-message', { room, message: msg });
  document.getElementById('msgInput').value = '';
}

socket.on('receive-message', ({ message, self }) => {
  logMsg((self ? '🧍 You' : '👤 Stranger') + ': ' + message, self);
});

function logMsg(msg, self = false) {
  const box = document.getElementById('chatBox');
  const div = document.createElement('div');
  div.textContent = msg;
  div.className = self ? 'msg-self' : 'msg-other';
  box.appendChild(div);
  box.scrollTop = box.scrollHeight;
}
