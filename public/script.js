// script.js
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

function sendGIF() {
  const gif = prompt("Enter GIF URL:");
  if (gif) {
    const msg = { type: 'image', data: gif };
    socket.emit('send-message', { room: currentRoom, message: msg });
    appendMsg(msg, true);
  }
}

socket.on('receive-message', msg => appendMsg(msg));
socket.on('update-users', count => onlineCount.textContent = count);
