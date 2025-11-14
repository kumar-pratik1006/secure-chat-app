// ✅ Improved Socket.IO connection
const socket = io({
  reconnection: true,
  reconnectionAttempts: Infinity,
  reconnectionDelay: 1000,
  transports: ['websocket'], // Force websocket to avoid polling delays
});

let currentRoom = '';

// --- DOM Elements ---
const roomInput = document.getElementById('roomInput');
const chatBox = document.getElementById('chatBox');
const msgInput = document.getElementById('msgInput');
const fileInput = document.getElementById('fileInput');
const preview = document.getElementById('preview');
const onlineCount = document.getElementById('onlineCount');

// ✅ Auto rejoin logic after reconnect
socket.on('connect', () => {
  console.log('✅ Connected to server:', socket.id);
  if (currentRoom) {
    socket.emit('join-room', currentRoom);
    console.log('🔁 Rejoined room:', currentRoom);
  }
});

socket.on('disconnect', reason => {
  console.log('⚠️ Disconnected:', reason);
});

socket.on('connect_error', err => {
  console.error('❌ Connection error:', err.message);
});

// --- Room Join ---
function joinRoom() {
  const room = roomInput.value.trim();
  if (!room) return alert('Room ID required');
  currentRoom = room;
  socket.emit('join-room', room);

  document.getElementById('joinedRoomId').textContent = room;
  document.getElementById('roomStatus').style.display = 'block';
  document.getElementById('roomJoin').style.display = 'none';
  console.log('🚪 Joined room:', room);
}

// --- Append Message to Chat ---
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

// --- Send Text Message ---
function sendMsg() {
  const text = msgInput.value.trim();
  if (!text || !currentRoom) return;

  const msg = { type: 'text', data: text };
  socket.emit('send-message', { room: currentRoom, message: msg });
  appendMsg(msg, true);
  msgInput.value = '';
  preview.style.display = 'none';
}

// --- Preview & Send Media ---
function previewMedia() {
  const file = fileInput.files[0];
  if (!file || !currentRoom) return;

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

// --- 🔁 Heartbeat (keep-alive ping) ---
setInterval(() => {
  if (currentRoom) {
    socket.emit('heartbeat', { room: currentRoom });
    // console.log('❤️ heartbeat sent');
  }
}, 20000); // every 20s

// --- Receive message ---
socket.on('receive-message', msg => appendMsg(msg));

// --- Online users update ---
socket.on('update-users', count => {
  onlineCount.textContent = count;
});

// --- Popup logic ---
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

// Notification permission
function requestNotificationPermission() {
  if (!("Notification" in window)) {
    alert("Browser does not support notifications");
    return;
  }

  Notification.requestPermission().then(permission => {
    if (permission === "granted") {
      console.log("Notification permission granted");
    }
  });
}

// Call once when user opens the app
requestNotificationPermission();


// Function to show notification
function showLocalNotification(title, body) {
  if (Notification.permission === "granted") {
    navigator.serviceWorker.getRegistration().then(reg => {
      if (reg) {
        reg.showNotification(title, {
          body: body,
          icon: "./icon.png",   // App ka icon yaha daal do
          vibrate: [200, 100, 200],
          badge: "./icon.png",
          tag: "chat-msg",
          renotify: true
        });
      }
    });
  }
}
