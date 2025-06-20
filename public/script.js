const socket = io();
let currentRoom = '';

const roomInput = document.getElementById('roomInput');
const chatBox = document.getElementById('chatBox');
const msgInput = document.getElementById('msgInput');
const fileInput = document.getElementById('fileInput');
const preview = document.getElementById('preview');
const onlineCount = document.getElementById('onlineCount');

function joinRoom() {
  currentRoom = roomInput.value.trim();
  if (!currentRoom) return alert('Room ID required');
  socket.emit('join-room', currentRoom);
  document.getElementById('joinedRoomId').textContent = currentRoom;
  document.getElementById('roomStatus').style.display = 'block';
  document.getElementById('roomJoin').style.display = 'none';
}

function appendMsg(msg, self = false) {
  const div = document.createElement('div');
  div.className = 'msg ' + (self ? 'self' : 'other');
  if (msg.type === 'text') {
    div.textContent = msg.data;
  } else if (msg.type === 'image') {
    div.innerHTML = `<img src="${msg.data}" />`;
  } else if (msg.type === 'file') {
    div.innerHTML = `<a href="${msg.data}" target="_blank">Download File</a>`;
  }
  chatBox.appendChild(div);
  chatBox.scrollTop = chatBox.scrollHeight;
}

function sendMsg() {
  const text = msgInput.value.trim();
  if (!text) return;
  const msg = { type: 'text', data: text };
  socket.emit('send-message', { room: currentRoom, message: msg });
  appendMsg(msg, true);
  msgInput.value = '';
  preview.style.display = 'none';
}

function previewMedia() {
  const file = fileInput.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = () => {
    let msg;
    if (file.type.startsWith('image/')) {
      msg = { type: 'image', data: reader.result };
      preview.innerHTML = `<img src="${reader.result}" />`;
    } else {
      msg = { type: 'file', data: reader.result };
      preview.innerHTML = `<p>${file.name}</p>`;
    }
    preview.style.display = 'block';

    socket.emit('send-message', { room: currentRoom, message: msg });
    appendMsg(msg, true);
  };
  reader.readAsDataURL(file);
}

// 🔄 Heartbeat to keep connection alive
setInterval(() => {
  if (currentRoom) {
    socket.emit('heartbeat', { room: currentRoom });
  }
}, 30000);

// 🔔 Receive msg
socket.on('receive-message', msg => appendMsg(msg));

// 👥 Online count update
socket.on('update-users', count => onlineCount.textContent = count);

function closePopup() {
  document.getElementById('featurePopup').style.display = 'none';
}

window.addEventListener('load', () => {
  if (localStorage.getItem('popupSeen')) {
    document.getElementById('featurePopup').style.display = 'none';
  } else {
    document.getElementById('featurePopup').style.display = 'flex';
  }
});

function closePopup() {
  document.getElementById('featurePopup').style.display = 'none';
  localStorage.setItem('popupSeen', 'true');
}
