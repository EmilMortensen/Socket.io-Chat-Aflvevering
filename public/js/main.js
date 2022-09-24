const chatForm = document.getElementById('chat-form');
const chatMessages = document.querySelector('.chat-messages');
const roomName = document.getElementById('room-name');
const userList = document.getElementById('users');

// Her får jeg vores Username og Room fra vores URL som den finder.
const { username, room } = Qs.parse(location.search, {
  ignoreQueryPrefix: true,
});

console.log({username, room})

const socket = io();

// Her joiner vi rummet
socket.emit('joinRoom', { username, room });

// Her får vi Room og Username ud
socket.on('roomUsers', ({ room, users }) => {
  outputRoomName(room);
  outputUsers(users);
});

// Her får vi en besked fra serveren
socket.on('message', (message) => {
  console.log(message);
  outputMessage(message);

  // Denne funktion gør man kan scrolle
  chatMessages.scrollTop = chatMessages.scrollHeight;
});

// Denne får der til at ske noget når man skriver
chatForm.addEventListener('submit', (e) => {
  e.preventDefault();

  // Denne får beskeden
  let msg = e.target.elements.msg.value;

  msg = msg.trim();

  if (!msg) {
    return false;
  }

  // Her Emit'er vi beskeden til serveren
  socket.emit('chatMessage', msg);

  // Her gør jeg besked baren blank igen efter en sendt besked
  e.target.elements.msg.value = '';
  e.target.elements.msg.focus();
});

// Her giver jeg en besked til hvad vores DOM skal gøre.
function outputMessage(message) {
  const div = document.createElement('div');
  div.classList.add('message');
  const p = document.createElement('p');
  p.classList.add('meta');
  p.innerText = message.username;
  p.innerHTML += `<span>${message.time}</span>`;
  div.appendChild(p);
  const para = document.createElement('p');
  para.classList.add('text');
  para.innerText = message.text;
  div.appendChild(para);
  document.querySelector('.chat-messages').appendChild(div);
}

// Her tilføjer jeg et rum til vores DOM
function outputRoomName(room) {
  roomName.innerText = room;
}

// Her tilføjer jeg bruger til DOM
function outputUsers(users) {
 console.log({users})
  userList.innerHTML = '';
  users.forEach((user) => {
    const li = document.createElement('li');
    li.innerText = user.username;
    userList.appendChild(li);
  });
}

//Her er en funktion til når man ville forlade rummet, og spørg serveren en ekstra gang om man ville forlade rummet, og hvis man ville forlade rummet ryger man tilbage til start menuen.
document.getElementById('leave-btn').addEventListener('click', () => {
  const leaveRoom = confirm('Are you sure you want to leave this classroom chat?');
  if (leaveRoom) {
    window.location = '../index.html';
  } else {
  }
});