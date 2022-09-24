
const path = require('path');
const http = require('http');
const express = require('express');
const socketio = require('socket.io');
const formatMessage = require('./helpers/formatDate')
const {
  getActiveUser,
  exitRoom,
  newUser,
  getIndividualRoomUsers
} = require('./helpers/userHelper');

const app = express();
const server = http.createServer(app);
const io = socketio(server);

// Her laver jeg mappen Public
app.use(express.static(path.join(__dirname, 'public')));

// Denne kode kører når klinter connecter
io.on('connection', socket => {
  socket.on('joinRoom', ({ username, room }) => {
    const user = newUser(socket.id, username, room);

    socket.join(user.room);

    // Når man joiner et rum kommer denne besked i chatten af en "bot"
    socket.emit('message', formatMessage("School Bot", 'Messages are limited to this classroom chat! '));

    // Hver gang en ny joiner, får de en besked som en "bot" skriver at de er joinet
    socket.broadcast
      .to(user.room)
      .emit(
        'message',
        formatMessage("School Bot", `${user.username} has joined the room`)
      );

    // Der hvor antallet af online i rummet og rummets navn
    io.to(user.room).emit('roomUsers', {
      room: user.room,
      users: getIndividualRoomUsers(user.room)
    });
  });

  // Lytter efter en besked fra klinten sender
  socket.on('chatMessage', msg => {
    const user = getActiveUser(socket.id);

    io.to(user.room).emit('message', formatMessage(user.username, msg));
  });

  // Koden når en klient går ud af rummet
  socket.on('disconnect', () => {
    const user = exitRoom(socket.id);

    if (user) {
      io.to(user.room).emit(
        'message',
        formatMessage("WebCage", `${user.username} has left the room`)
      );

      // Liste af online og rummets navn lige nu
      io.to(user.room).emit('roomUsers', {
        room: user.room,
        users: getIndividualRoomUsers(user.room)
      });
    }
  });
});

const PORT = process.env.PORT || 2665;

server.listen(PORT, () => console.log(`Server running on port ${PORT}`));