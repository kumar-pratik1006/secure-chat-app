// script.js
const socket = io();
let currentRoom = '';
let userId = Math.random().toString(36).substring(2);

function joinRoom() {
  const room = document.getElementById('roomInput').value.trim();
  if (!room) return;
  currentRoom = room;
  socket.emit('join-room', room);
  document.getElementById('roomJoin').style.display = 'none';
  document.getElementById('roomStatus').style.display = 'block';
  document.getElementById('joinedRoomId').innerText = room;
  addSystemMsg('Joined room successfully ✅');
}

function sendMsg() {
  const msg = document.getElementById('msgInput').value.trim();
  const file = document.getElementById('fileInput').files[0];
  if (!msg && !file) return;

  let messageObj = { from: userId };

  if (file) {
    const reader = new FileReader();
    reader.onload = function () {
      const base64 = reader.result;
      messageObj.file = { name: file.name, type: file.type, data: base64 };
      emitAndShow(messageObj);
    };
    reader.readAsDataURL(file);
  } else {
    messageObj.text = msg;
    emitAndShow(messageObj);
  }
  document.getElementById('msgInput').value = '';
  document.getElementById('fileInput').value = '';
  document.getElementById('preview').innerHTML = '';
}

function sendGIF() {
  const url = prompt("Paste GIF URL:");
  if (!url) return;
  const messageObj = { from: userId, gif: url };
  emitAndShow(messageObj);
}

function emitAndShow(messageObj) {
  socket.emit('send-message', { room: currentRoom, message: messageObj });
  addMsg(messageObj, true);
}

socket.on('receive-message', message => {
  addMsg(message, false);
});

socket.on('update-users', count => {
  document.getElementById('onlineCount').innerText = count;
});

function addMsg(message, self) {
  const chatBox = document.getElementById('chatBox');
  const msgDiv = document.createElement('div');
  msgDiv.className = 'msg ' + (self ? 'self' : 'other');

  if (message.text) msgDiv.textContent = message.text;
  else if (message.file) {
    if (message.file.type.startsWith('image')) {
      const img = document.createElement('img');
      img.src = message.file.data;
      img.style.maxWidth = '200px';
      msgDiv.appendChild(img);
    } else {
      const link = document.createElement('a');
      link.href = message.file.data;
      link.download = message.file.name;
      link.textContent = `Download ${message.file.name}`;
      msgDiv.appendChild(link);
    }
  } else if (message.gif) {
    const gif = document.createElement('img');
    gif.src = message.gif;
    gif.style.maxWidth = '200px';
    msgDiv.appendChild(gif);
  }

  chatBox.appendChild(msgDiv);
  chatBox.scrollTop = chatBox.scrollHeight;
}

function previewMedia() {
  const file = document.getElementById('fileInput').files[0];
  const preview = document.getElementById('preview');
  preview.innerHTML = '';
  if (file && file.type.startsWith('image')) {
    const reader = new FileReader();
    reader.onload = function () {
      const img = document.createElement('img');
      img.src = reader.result;
      preview.appendChild(img);
    };
    reader.readAsDataURL(file);
  }
}

function addSystemMsg(msg) {
  const chatBox = document.getElementById('chatBox');
  const sys = document.createElement('div');
  sys.style.color = '#999';
  sys.style.fontSize = '14px';
  sys.style.textAlign = 'center';
  sys.innerText = msg;
  chatBox.appendChild(sys);
  chatBox.scrollTop = chatBox.scrollHeight;
}
