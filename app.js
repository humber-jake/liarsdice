const express = require('express');
const app = express()
const http = require('http').Server(app);
const io = require('socket.io')(http);
const port = process.env.PORT || 3000;

function isObjectEmpty(obj) {
  return Object.keys(obj).length === 0;
}

let users = {};
    rooms = {};

app.use(express.static(__dirname))

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html');
});

io.on('connection', (socket) => {
  console.log(`The user ${socket.id} connected`);
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
    if(!rooms[newUser.currentRoom]){
        const newRoom = new Room(roomID);
        newRoom.users[socket.id] = newUser;
        rooms[roomID] = newRoom;
      } else {
        rooms[newUser.currentRoom].users[newUser.id] = newUser;
        socket.join(newUser.currentRoom);
      }
    users[socket.id] = newUser;
    console.log('==============')
    console.log('ROOMS')
    console.log('==============')
    console.log(rooms)
    console.log('==============')
    console.log('USERS')
    console.log('==============')
    console.log(users)

    socket.emit('message', rooms, users);
    socket.on('disconnect', () => {
      console.log(`${socket.id} disconnected!`);
      delete users[socket.id];
      if(rooms[roomID].users){delete rooms[roomID].users[socket.id]}
      if(isObjectEmpty(rooms[roomID].users) === true)
      {delete rooms[roomID]}
    })
  })

});

http.listen(port, () => {
    console.log(`Server listening on port ${port}`);
  });