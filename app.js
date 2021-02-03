const express = require('express');
const { emit } = require('process');
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

  const broadcastEvent = (event) => {
    socket.on(event, (id) => {
    let room = rooms[users[id].currentRoom];
    console.log(`${room.id}: ${event}`);
    io.to(room.id).emit(event);
    })
  }

  console.log(`The user ${socket.id} connected`);
  socket.on('join or create room', (roomID, username) => {

    class User {
      constructor(username, roomID){
        this.username = username,
        this.id = socket.id,
        this.number;
        this.currentRoom = roomID;
        this.isHost = false;
        this.dice;
        this.diceColor;
      }
    }

    class Room {
      constructor(roomID){
        this.id = roomID;
        this.users = {};
        this.diceValues = {};
      }
    }

    // on connect, create USER for socket
    const newUser = new User(username, roomID);

    // Check for room code, create if room doesn't exist
    if(!rooms[newUser.currentRoom]){
      const newRoom = new Room(roomID);
      // Because user made room, make host
      newUser.isHost = true;
      socket.emit('isHost', newUser);
      // add user to room.users object
      newRoom.users[socket.id] = newUser;
      // add new room to rooms object
      rooms[roomID] = newRoom;
      // user joins room socket
      socket.join(newUser.currentRoom);
    } else {
      // add user to specified room object
      rooms[newUser.currentRoom].users[newUser.id] = newUser;
      // user joins room socket
      socket.join(newUser.currentRoom);
    }

    // add user to users object, server console rooms and users
    users[socket.id] = newUser;
    console.log('==============')
    console.log('ROOMS')
    console.log('==============')
    console.log(rooms)
    console.log('==============')
    console.log('USERS')
    console.log('==============')
    console.log(users)

    // display username and room code
    socket.emit('HUD', roomID, username);
    io.to(rooms[roomID].id).emit('playerJoined', users);

    // on disconnect, remove user from users object and room
    socket.on('disconnect', () => {
      console.log(`${socket.id} disconnected!`);
      delete users[socket.id];
      delete rooms[roomID].users[socket.id]

      // if no users in room on disconnect, delete room
      if(isObjectEmpty(rooms[roomID].users) === true){
        delete rooms[roomID]
      }
    })
  })
  broadcastEvent('startGame');
  broadcastEvent('rollAllDice');
  broadcastEvent('makeBet');
  broadcastEvent('raise');
  broadcastEvent('callBluff');
});

http.listen(port, () => {
    console.log(`Server listening on port ${port}`);
  });



