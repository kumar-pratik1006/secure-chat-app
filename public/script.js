const socket = io();
let room = '';
let myId = '';

socket.on('connect', () => {
  myId = socket.id;
});

function joinRoom() {
  room = document.getElementById('roomInput').value;
  if (room) {
    socket.emit('join-room', room);
    document.getElementById('chatBox').innerHTML = '';
  }
}

function sendMsg() {
  const input = document.getElementById('msgInput');
  const file = document.getElementById('fileInput').files[0];

  if (file) {
    const reader = new FileReader();
    reader.onload = () => {
      const base64 = reader.result;
      let fileType = file.type;

      const data = {
        room,
        sender: myId,
        type: fileType.startsWith('image') ? 'image' : 'file',
        content: base64,
        fileName: file.name,
        fileSize: file.size
      };
      socket.emit('send-message', data);
    };
    reader.readAsDataURL(file);
  } else if (input.value.trim()) {
    socket.emit('send-message', {
      room,
      sender: myId,
      type: 'text',
      content: input.value.trim()
    });
  }

  input.value = '';
  document.getElementById('fileInput').value = '';
}

function sendGIF() {
  const keyword = prompt("Enter GIF keyword:");
  if (!keyword) return;

  fetch(`https://api.giphy.com/v1/gifs/search?api_key=dc6zaTOxFJmzC&q=${keyword}&limit=1`)
    .then(res => res.json())
    .then(data => {
      const gifUrl = data.data[0]?.images?.downsized_medium?.url;
      if (gifUrl) {
        socket.emit('send-message', {
          room,
          sender: myId,
          type: 'image',
          content: gifUrl
        });
      }
    });
}

socket.on('receive-message', data => {
  const msgDiv = document.createElement('div');
  msgDiv.classList.add('msg');
  msgDiv.classList.add(data.sender === myId ? 'self' : 'other');

  if (data.type === 'text') {
    msgDiv.textContent = data.content;
  } else if (data.type === 'image') {
    const img = document.createElement('img');
    img.src = data.content;
    msgDiv.appendChild(img);
  } else if (data.type === 'file') {
    const a = document.createElement('a');
    a.href = data.content;
    a.textContent = `${data.fileName} (${(data.fileSize / 1024).toFixed(1)} KB)`;
    a.download = data.fileName;
    msgDiv.appendChild(a);
  }

  document.getElementById('chatBox').appendChild(msgDiv);
  document.getElementById('chatBox').scrollTop = document.getElementById('chatBox').scrollHeight;
});
