const express = require('express');
const app = express()
const http = require('http').Server(app);
const io = require('socket.io')(http);
const port = process.env.PORT || 3000;

let users = {};
    rooms = {};

app.use(express.static(__dirname))

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html');
});

io.on('connection', (socket) => {
  console.log(`The user ${socket.id} connected`);
  socket.on('disconnect', () => {
    console.log('disconnect!');
    // users = users.filter(u => u.id !== socket.id);
  })
});

io.on('connection', (socket) => {
  socket.on('join or create room', (roomID, username) => {
    class User {
      constructor(username, roomID){
        this.username = username,
        this.id = socket.id,
        this.number;
        this.currentRoom = roomID;
      }
    }
    class Room {
      constructor(roomID){
        this.id = roomID;
        this.users = {};
        }
      }
    const newUser = new User(username, roomID);
    const newRoom = new Room(roomID);
    newRoom.users[socket.id] = newUser;
    rooms[roomID] = newRoom;
    users[socket.id] = newUser;
    console.log('==============')
    console.log(rooms)
    console.log('==============')
    console.log(users)

    socket.join(roomID);
    socket.emit('message', rooms, users);
  })
});


 

http.listen(port, () => {
    console.log(`Server listening on port ${port}`);
  });