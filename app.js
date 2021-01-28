const express = require('express');
const app = express()
const http = require('http').Server(app);
const io = require('socket.io')(http);
const port = process.env.PORT || 3000;

app.use(express.static(__dirname))

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html');
});

io.on('connection', (socket) => {
  console.log(`The user ${socket.id} connected to the room ${socket.rooms}`);
  socket.on('disconnect', () => {
      console.log('user disconnected');
  })
});

io.on('connection', (socket) => {
  socket.on('chat message', (msg) => {
    console.log('message: ' + msg);
  });
});

http.listen(port, () => {
    console.log(`Server listening on port ${port}`);
  });